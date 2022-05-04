const collegeModel = require('../models/collegeModel')
const validUrl = require('valid-url')

function isValid(data){
    if(typeof data === undefined || data === null) return false
    if(typeof data === 'string' && data.trim().length === 0) return false
    return true
}

function isValidRequestBody(requestBody){
    return Object.keys(requestBody).length > 0
}

function isValidLink(link){
    if(validUrl.isUri(link)){
        return true
    }
    else{
        return false
    }
}

const createCollege = async function(req, res){

    try{
        const collegeDetails = req.body

        if( !isValidRequestBody(collegeDetails) ){
            return res.status(400).send({status: false, msg: "All fields are required"})
        }

        const {name, fullName, logoLink, isDeleted} = collegeDetails

        if( !isValid(name) ){
            return res.status(400).send({status: false, msg: "Name is required"})
        }
        if( !isValid(fullName) ){
            return res.status(400).send({status: false, msg: "fullName is required"})
        }
        if( !isValid(logoLink) ){
            return res.status(400).send({status: false, msg: "logoLink is required"})
        }

        if( !isValidLink(logoLink) ){
            return res.status(400).send({status: false, msg: "Not a link"})
        }

        if( !isValid(isDeleted) ){
            return res.status(400).send({status: false, msg: "isDeleted is required"})
        }

        const isNamePresent = await collegeModel.findOne(name)

        const collegeData = await collegeModel.create(collegeDetails)
        return res.status(201).send({status: true, data: collegeData})
    }
    catch (err){
        return res.status(500).send({status: false, msg: err.message})
    }

}

module.exports = {createCollege}