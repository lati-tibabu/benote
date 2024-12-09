const {user, team} = require('../models');

const assignUserToTeam = async (req, res) => {
    try {
        const userObj = await user.findOne({ where: { id: req.body.user_id } });
        const teamObj = await team.findOne({ where: { id: req.body.team_id } });

        if (!userObj || !teamObj) {
            res.send("User or team is not found to be bound");
        } else {
            await teamObj.addMember(userObj);
            res.status(200).json({ message: "User assigned to team" });
        }

        // // Use the correct association method
        // await teamObj.addMember(userObj); 

        // return {
        //     message: 'User assigned to team'
        // };
    } catch (error) {
        console.error(error);
        throw error; // Or handle the error appropriately for your application
    }
};

const getUserTeam = async (req, res) => {
    try {
        const _user = await user.findByPk(req.params.user_id, {

            include: [{
                model: team,
                as: 'inTeams',
                attributes: ['name', 'created_by']
            }]
        });

        if (!_user) {
            res.status(404).json({ message: 'User not found' });
        } else {
            res.status(302).json({_user});
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};


const getTeamUser = async (req, res) => {
    try {
        const _team = await team.findByPk(req.params.team_id, {

            include: [{
                model: user,
                as: 'members',
                attributes: ['name', 'email']
            }]
        });

        if (!_team) {
            res.status(404).json({ message: 'Team not found' });
        } else {
            res.status(302).json({_team});
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

const removeUserTeam = async (req, res) => {
    try {
        const userObj = await user.findByPk(req.body.user_id);        
        const teamObj = await team.findByPk(req.body.team_id);

        if (!userObj || !teamObj) {
            res.send("User or team is not found to be unbound");
        } else {
            await teamObj.removeMember(userObj);
            res.status(200).json({ message: "User removed from team" });
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

module.exports = {
    assignUserToTeam,
    getUserTeam,
    getTeamUser,
    removeUserTeam,
}