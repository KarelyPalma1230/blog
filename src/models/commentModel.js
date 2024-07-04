import { Schema, model } from 'mongoose';
//entidad comentarios y los respectivos campos que contendra la tabla
const commentSchema = new Schema({
    autor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true, 
    },
    contenido: {
        type: String,
        required: true,
    },
    publicacion: {
        type: Schema.Types.ObjectId,
        ref: 'Publication',
        required: true,
    },
    fechaCreacion: {
        type: Date,
        default: Date.now(),
    }
 });

 const Comment = model('Comment', commentSchema);

 export default Comment;
