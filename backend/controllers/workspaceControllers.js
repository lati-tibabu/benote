const { workspace, workspace_membership, user} = require("../models");
const { team } = require("../models");

// Create
const createWorkspace = async (req, res) => {
    try {
        const _workspace = await workspace.create(req.body);
        if(_workspace){
            await workspace_membership.create({
                workspace_id: _workspace.id,
                // user_id: req.user.id,
                user_id: _workspace.owned_by,
                role: 'admin'
            });
        }
        res.status(201).json(_workspace);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

// give user membership 
const giveUserMembership = async (req, res) => {
    try {
        const _workspace = await workspace.findByPk(req.params.id);
        if(!_workspace){
            res.status(404).json({message: 'Workspace not found'});
        }
        const _membership = await workspace_membership.create({
            workspace_id: req.params.id,
            user_id: req.body.user_id,
            role: 'member'
        });
        res.status(201).json(_membership);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

// Read
const readWorkspaces = async (req, res) => {
    try {
        // const userId = req.user.id;

        const _workspaces = await workspace_membership.findAll({
            attributes: ['role','workspace_id'],
            where: {
                // created_by: req.user.id
                user_id: req.user.id,
                // user_id: req.body.user_id
            },
            include: [
                {
                model: workspace,
                as: 'workspace',
                required: true,

                include: [
                    {
                        model: team, 
                        as: 'team', // This should be aligned with the association name
                        required: false, // Use `required: true` to ensure workspaces with a team are returned
                    },
                    {
                        model: workspace_membership,
                        as: 'memberships',
                        required: false,
                        attributes: ['role'],
                        include: [
                            {
                                model: user,
                                as: 'user',
                                attributes: ['name', 'email']
                            }
                        ]
                    }
                    // {
                    //     model: user, // Assuming you also want to include the user who created the workspace
                    //     as: 'user', // This should be aligned with the association name in `workspace`
                    // },
                    // {
                    //     model: task, // If you want to include tasks
                    //     as: 'tasks', // This should match the `hasMany` association name
                    // },
                ],
                }
            ]
        });
        res.json(_workspaces);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


const readWorkspace = async (req, res) => {
    try {
        const _workspace = await workspace.findByPk(req.params.id);
        if (_workspace){
            res.json(_workspace);
        } else{
        res.status(404).json({message: 'Workspace not found!'});
        }
    } catch (error) {
        res.status(500).json({message: error.message}); 
    }
}

// Update

const updateWorkspace = async (req, res) => {
    try {
        const _workspace = await workspace.findByPk(req.params.id);
        if (_workspace){
            await _workspace.update(req.body)
            const updatedWorkspace = {..._workspace.get()}
            res.json(updatedWorkspace)
        } else {
            res.status(404).json({message: 'Workspace not found1'});
        }
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

// Delete

const deleteWorkspace = async (req, res) => {
    try {
        const _workspace = await workspace.findByPk(req.params.id);
        if(_workspace){
            await _workspace.destroy();
            res.json({message: 'Workspace succesfully deleted'});
        } else {
            res.status(404).json({message: 'Workspace not found'});
        }
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

module.exports = {
    createWorkspace,
    readWorkspaces,
    readWorkspace,
    giveUserMembership,
    updateWorkspace,
    deleteWorkspace
}