import mongoose from 'mongoose'

const planSchema = new mongoose.Schema({
    _id: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    created: Date,
    updated: Date,
    dungId: String,
    affixes: Number,
    canvases: [{
        _id: Number,
        uri: String
    }],
    units: [{
        _id: Number,
        selected: Boolean
    }],
    notes: [{
        _id: Number,
        text: String,
        position: {
            x: Number,
            y: Number
        },
        levelId: Number
    }]
})

const PlanModel = mongoose.model('Plan', planSchema)

export default PlanModel
