
const getDate = function (){
const today = new Date();
     
    const options ={
        weekday: "long",
        day: "numeric",
        month: "long"
    }

    const day = today.toLocaleDateString("en-US", options)

    return day;
}

const getDay = function (){
const today = new Date();
     
    const options ={
        weekday: "long",
        
    }
   return  today.toLocaleDateString("en-US", options) 

}

module.exports.getDate  = getDate
module.exports.getDay  = getDay