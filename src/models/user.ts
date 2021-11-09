import { Schema, model, SchemaTypes } from 'mongoose';

const user: Schema = new Schema({
    name: {
        type: SchemaTypes.String,
    },
    gender: {
        type: SchemaTypes.String,
    },
    email: {
        type: SchemaTypes.String,
    }
});

export default model('user', user);
