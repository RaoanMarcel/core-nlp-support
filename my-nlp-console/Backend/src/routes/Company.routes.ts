// Backend/src/routes/Company.routes.ts
import { Router } from 'express';
import { CompanyController } from '../controllers/Company.controller';
import { authMiddleware, checkPermission } from '../middlewares/auth'; // Importe seus middlewares do caminho correto

const companyRoutes = Router();

companyRoutes.use(authMiddleware);

companyRoutes.get('/', CompanyController.getAll);
companyRoutes.get('/:id', CompanyController.getById);

companyRoutes.post('/', checkPermission('companies:create'), CompanyController.create);
companyRoutes.put('/:id', checkPermission('companies:edit'), CompanyController.update);
companyRoutes.delete('/:id', checkPermission('companies:delete'), CompanyController.delete);

export { companyRoutes };