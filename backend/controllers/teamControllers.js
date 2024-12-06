const { team } = require('../models');

const createTeam = async (req, res) => {
    try {
        const _team = await team.create(req.body);
        res.status(201).json(_team);
    } catch (error) {
        res.status(500).json({message: error.message});        
    }
};

const readTeams = async (req, res) => {
    try {
        const teams = await team.findAll();
        res.json(teams);
    } catch (error) {
        res.status(500).json({message: error.message});        
    }
};

const readTeam = async (req, res) => {
    try {
        const _team = await team.findByPk(req.params.id);
        if (_team) {
            res.json(_team);
        } else{
            res.status(404).json({message: "Team not found!"});
        }
    } catch (error) {
        res.status(500).json({message: error.message});        
    }
};

const updateTeam = async (req, res) => {
    try {
        const _team = await team.findByPk(req.params.id);
        if (_team){
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
        const _team = await team.findByPk(req.params.id);
        if (!_team){
            res.status(404).json({message: "Team not found!"});
        } else {
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
}