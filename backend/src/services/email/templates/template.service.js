import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import { AppError } from '../../../middleware/errors.js';

const templateCache = new Map();
const templatesPath = path.join(process.cwd(), 'src/templates/email');

const loadTemplate = async (templateName) => {
  if (templateCache.has(templateName)) {
    return templateCache.get(templateName);
  }

  try {
    const templatePath = path.join(templatesPath, `${templateName}.hbs`);
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const compiledTemplate = handlebars.compile(templateContent);
    
    templateCache.set(templateName, compiledTemplate);
    return compiledTemplate;
  } catch (error) {
    throw new AppError(
      `Template ${templateName} not found`, 
      500, 
      'TEMPLATE_NOT_FOUND'
    );
  }
};

export const renderTemplate = async (templateName, data = {}) => {
  const template = await loadTemplate(templateName);
  return template(data);
};

export const clearTemplateCache = () => {
  templateCache.clear();
};