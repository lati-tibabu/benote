const { team, team_membership, user } = require('../models');
// const { team, team_membership } = require('../models');
const { Sequelize, where } = require('sequelize');

const createTeam = async (req, res) => {
    const { name } = req.body;
    const userId = req.user.id;

    if (!name) {
        return res.status(400).json({ message: "Team name is required" });
    }

    const transaction = await team.sequelize.transaction(); // Start a transaction

    try {
        // Create the team
        const _team = await team.create({ name, created_by: userId }, { transaction });

        // Assign the creator as an admin in the membership table
        await team_membership.create({
            team_id: _team.id,
            user_id: userId,
            role: 'admin'
        }, { transaction });

        await transaction.commit(); // Commit transaction
        return res.status(201).json(_team);
    } catch (error) {
        await transaction.rollback(); // Rollback on failure

        if (error instanceof Sequelize.ValidationError) {
            return res.status(400).json({ message: error.errors.map(e => e.message) });
        }

        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// const createTeam = async (req, res) => {
//     // const user_id = req.user.id;
//     // const { name } = req.body;
//     try {
//         const _team = await team.create({ ...req.body, created_by: req.user.id });
//         if(_team){
//             await team_membership.create({
//                 team_id: _team.id,
//                 // user_id: req.user.id,
//                 user_id: _team.created_by,
//                 role: 'admin'
//             });
//         }
//         res.status(201).json(_team);
//     } catch (error) {
//         res.status(500).json({message: error.message});        
//     }
// };

const giveUserMembership = async (req, res) => {
    try {
        const _team = await team.findByPk(req.params.team_id);

        if(!_team){
            return res.status(404).json({message: 'team not found'});
        }

        const is_member_and_admin = await team_membership.findOne({
            where: {
                team_id: req.params.team_id,
                user_id: req.user.id,
                role: 'admin'
            }
        });

        if (!is_member_and_admin){
            return res.status(401).json({message: 'Unauthorized: You are not an admin of this team'});
        }

        const _membership = await team_membership.create({
            team_id: req.params.team_id,
            user_id: req.body.user_id,
            role: 'member'
        });

        res.status(201).json(_membership);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

const promoteTeamAdmin = async (req, res) => {
    try {
        const teamId = req.params.team_id;
        const userId = req.user.id;

        
        const _team = await team.findByPk(teamId);

        if(!_team){
            return res.json(404).json({message: 'team not found'});
        }
        const isTeamCreatedByUser = await team.findOne({
            where: {
                id: teamId,
                created_by: userId
            }
        });

        const is_member_and_admin = await team_membership.findOne({
            where: {
                team_id: teamId,
                user_id: userId,
                role: 'admin'
            }
        });

        if(!is_member_and_admin || !isTeamCreatedByUser){
            return res.status(401).json({message: 'Unauthorized: You are not an admin of this team'});
        }

        const checkMembership = await team_membership.findOne({
            where: {
                team_id: teamId,
                user_id: req.body.user_id
            }
        });

        if(!checkMembership){
            const _membership = await team_membership.create({
                team_id: teamId,
                user_id: req.body.user_id,
                role: 'admin'
            });
            res.status(201).json(_membership);
        } else {
            const _membership = await team_membership.update({
                role: 'admin'
            }, {
                where: {
                    team_id: teamId,
                    user_id: req.body.user_id
                }
            });
            res.status(200).json(_membership)
        }
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message })
    }
}

const demoteTeamAdmin = async (req, res) => {
    try {
        const teamId = req.params.team_id;
        const userId = req.user.id;

        const _team = await team.findByPk(teamId);

        if(!_team){
            return res.json(404).json({message: 'team not found'});
        }

        const isTeamCreatedByUser = await team.findOne({
            where: {
                id: teamId,
                created_by: userId
            }
        });
        
        const is_member_and_admin = await team_membership.findOne({
            where: {
                team_id: teamId,
                user_id: userId,
                role: 'admin'
            }
        });

        if(!is_member_and_admin || !isTeamCreatedByUser){
            return res.status(401).json({message: 'Unauthorized: You are not an admin of this team'});
        }

        const checkMembership = await team_membership.findOne({
            where: {
                team_id: teamId,
                user_id: req.body.user_id,
                role: 'admin'
            }
        });

        if(checkMembership && userId != req.body.user_id){
            const _membership = await team_membership.update({
                role: 'member'
            }, {
                where: {
                    team_id: req.params.team_id,
                    user_id: req.body.user_id
                }
            });
            res.status(200).json(_membership)
        }
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message })
    }
}


const removeUserMember = async (req, res) => {
    try {
        const teamId = req.params.team_id;
        const userId = req.user.id;
        const targetUser = req.params.user_id;

        
        const _team = await team.findByPk(teamId);

        if(!_team){
            return res.json(404).json({message: 'team not found'});
        }
        // const isTeamCreatedByUser = await team.findOne({
        //     where: {
        //         id: teamId,
        //         created_by: userId
        //     }
        // });

        const is_member_and_admin = await team_membership.findOne({
            where: {
                team_id: teamId,
                user_id: userId,
                role: 'admin'
            }
        });

        if(!is_member_and_admin){
            return res.status(401).json({message: 'Unauthorized: You are not an admin of this team'});
        }

        const checkMembership = await team_membership.findOne({
            where: {
                team_id: teamId,
                user_id: targetUser,
                role: "member"
            }
        });

        if(!checkMembership) return res.status(400).json({message: "admin can only be removed by the owner"});

        await checkMembership.destroy();
        res.status(200).json({message: "membership removed"})
       
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message })
    }
}

const readTeam = async (req, res) => {
    try {
        // const { team_id } = req.params; 
        const team_id = req.params.id; 

        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized: User ID missing" });
        }

        const isMember  = await team_membership.findOne({
            where: {
                team_id: team_id,
                user_id: req.user.id
            }
        })

        if(!isMember) return res.status(401).json({message: "Unauthorized: You are not a member of this team"})

        const teamData = await team.findOne({
            where: { id: team_id },
            attributes: ['id', 'name', 'created_by', 'createdAt'],
            include: [
                {
                    model: team_membership,
                    as: 'memberships',
                    attributes: ['role'],
                    include: [
                        {
                            model: user,
                            as: 'user',
                            attributes: ['id', 'name', 'email'],
                            order: [['name', 'ASC']]
                        }
                    ]
                }
            ]
        });

        if (!teamData) {
            return res.status(404).json({ message: "Team not found" });
        }

        const formattedTeam = {
            id: teamData.id,
            name: teamData.name,
            created_by: teamData.created_by,
            createdAt: teamData.createdAt,
            members: teamData.memberships.map(member => ({
                id: member.user.id,
                name: member.user.name,
                email: member.user.email,
                role: member.role
            }))
        };

        return res.status(200).json(formattedTeam);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


const readTeams = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized: User ID missing" });
        }

        const memberships = await team_membership.findAll({
            attributes: ['role', 'team_id'],
            where: { user_id: req.user.id },
            include: [
                {
                    model: team,
                    as: 'team',
                    attributes: ['id', 'name', 'created_by', 'createdAt'], 
                    include: [
                        {
                            model: team_membership,
                            as: 'memberships',
                            attributes: ['role'], 
                            include: [
                                {
                                    model: user,
                                    as: 'user',
                                    attributes: ['id', 'name', 'email'],
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        // Format the response for better readability <--  this is all chatGPT idea - I swear I didn't write this
        const formattedTeams = memberships.map(membership => ({
            role: membership.role,
            team: {
                id: membership.team.id,
                name: membership.team.name,
                created_by: membership.team.created_by,
                createdAt: membership.team.createdAt,
                members: membership.team.memberships.map(member => ({
                    id: member.user.id,
                    name: member.user.name,
                    email: member.user.email,
                    role: member.role
                }))
            }
        }));

        return res.status(200).json(formattedTeams);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const updateTeam = async (req, res) => {
    try {
        const teamId = req.params.id;
        const userId = req.user.id;

        const _team = await team.findByPk(teamId);
        if (_team){
            // const isTeamCreatedByUser = await team.findOne({
            //     where: {
            //         id: teamId,
            //         created_by: userId
            //     }
            // });
            const is_member_and_admin = await team_membership.findOne({
                where: {
                    team_id: teamId,
                    user_id: userId,
                    role: 'admin'
                }
            });

            if(!is_member_and_admin){
                return res.status(401).json({message: 'Unauthorized: You are not an admin of this team'});
            }
            
            await _team.update(req.body);
            const updatedTeam = {..._team.get()};
            res.json(updatedTeam);
        } else{
            res.status(404).json({message: "Team not found!"});
        }
    } catch (error) {
        res.status(500).json({message: error.message});        
    }
};

const deleteTeam = async (req, res) => {
    try {
        const teamId = req.params.id;
        const userId = req.user.id;

        const _team = await team.findByPk(teamId);

        if (!_team){
            res.status(404).json({message: "Team not found!"});
        } else {    
            const isTeamCreatedByUser = await team.findOne({
                where: {
                    id: teamId,
                    created_by: userId
                }
            });
            const is_member_and_admin = await team_membership.findOne({
                where: {
                    team_id: teamId,
                    user_id: userId,
                    role: 'admin'
                }
            });

            if(!is_member_and_admin || !isTeamCreatedByUser){
                return res.status(401).json({message: 'Unauthorized: You are not an admin of this team'});
            }
            
            await _team.destroy();
            res.json({message: 'Team deleted'})
        }
    } catch (error) {
        res.status(500).json({message: error.message});        
    }
};

module.exports = {
    createTeam,
    readTeams,
    readTeam,
    updateTeam,
    deleteTeam,
    giveUserMembership,
    promoteTeamAdmin,
    demoteTeamAdmin,
    removeUserMember
}