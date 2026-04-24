const mongoose = require('mongoose')

const directMongoURI = "mongodb://devadarshb01:Devadarshb01@cluster0-shard-00-00.pgqa5.mongodb.net:27017,cluster0-shard-00-01.pgqa5.mongodb.net:27017,cluster0-shard-00-02.pgqa5.mongodb.net:27017/clientTrackDB?ssl=true&replicaSet=atlas-p522v1-shard-0&authSource=admin&retryWrites=true&w=majority";

mongoose.connect(directMongoURI)
.then(() => console.log('MongoDB Connected!'))
.catch((err) => console.log(err))
