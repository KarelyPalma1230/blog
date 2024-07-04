import Comment from "../models/commentModel.js";
import Publication from "../models/publicationModel.js";
import { body } from 'express-validator';
import { handleValidationErrors } from "../config/validationsError.js";

//metodo para validaciones del contenido de la publicacion
const validateCommentData = [
    body('contenido').trim().notEmpty().withMessage('El contenido es obligatorio').escape(),
    body('publicacionId').trim().notEmpty().withMessage('El ID de la publicación es obligatorio').isMongoId().withMessage('El ID de la publicación debe ser un ID válido'),
];

//metodo para crear un comentario en las publicaciones 
export const createComment = [
    validateCommentData,
    handleValidationErrors,
    async (req, res) => {
        try {
            const {contenido, publicacionId} = req.body;
            const autor = req.user.userId
            const newComment = new Comment({
                contenido,
                autor,
                publicacion: publicacionId,
            });
            await newComment.save();
    
            const publication = await Publication.findById(publicacionId); //se busca la publicacion y si no se encuentra la publicacion se retorna un 404
            if (!publication) {
                return res.status(404).json({ error: 'Publicación no encontrada' });
            }
            publication.comentarios.push(newComment._id);
            await publication.save();
    
            res.status(201).json(newComment);
        } catch (e) {
            res.status(400).json({error: e.message});
        }
    },
];
//si eres el autor del comentario podras editarlo este es el metodo para editar comentarios 
export const editComment = [
    validateCommentData,
    handleValidationErrors,
    async (req, res) => {
        const {id} = req.params;
        try{
            const comment = await Comment.findById(id);//primero se verifica que exista un comentario se buscan por el id
            if(!comment){
                return res.status(404).json({message: 'Comentario no encontrado'});
            }
            if (comment.autor.toString() !== req.user.userId){//se valida que seas el autor del comentario 
                return res.status(403).json({ message: 'Unauthorized: no eres el autor' });
            }
            const updates = req.body;
            const updateComment = await Comment.findByIdAndUpdate(id, updates, {new: true});
            res.status(200).json(updateComment);

        }catch(e){
            res.status(400).json({ error: e.message });
        }
    }
];
//metodo para eliminar el comentario 
export const deleteComment = async (req, res) => {
    const {id} = req.params;
    try {
        const comment = await Comment.findById(id);//solo el autor de los comentarios podra eliminarlo
        if (comment.autor.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized: no puedes borrar el comentario si no eres autor' });
        }
            if(!comment) {
            return res.status(404).json({message:'comentario no encontrado'});
        }
        await Comment.findByIdAndDelete(id);
        res.json({message: 'eliminado con exito '});
    }catch(e){
        res.status(500).json({message: e.message});
    }
};