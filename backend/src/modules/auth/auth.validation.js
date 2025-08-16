import Joi from 'joi';

//------<< register schema >>-----------
export const registerSchema = Joi.object({
    name: Joi.string().min(1).max(100).required(),
    email: Joi.string().email().optional(),
    phone: Joi.string().min(10).max(15).required(),
    password: Joi.string().min(6).max(100).required(),
});

//------<< login schema >>-----------
export const loginSchema = Joi.object({
    identifier: Joi.string().min(1).required(),
    password: Joi.string().min(1).required(),
});

//------<< refresh token schema >>-----------
export const refreshSchema = Joi.object({
    refreshToken: Joi.string().min(1).required(),

});

//------<< change password schema >>-----------
export const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().min(1).required(),
    newPassword: Joi.string().min(6).max(100).required(),
});

//------<< forgot password schema >>-----------
export const forgotPasswordSchema = Joi.object({
    identifier: Joi.string().min(1).required(),
});

//------<< reset password schema >>-----------
export const resetPasswordSchema = Joi.object({
    token: Joi.string().min(1).required(),
    newPassword: Joi.string().min(6).max(100).required(),
});