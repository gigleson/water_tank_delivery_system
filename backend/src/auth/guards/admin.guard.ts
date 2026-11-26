
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
} from '@nestjs/common';

import { UserRole } from '../../users/model/users.model';

@Injectable()
export class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || user.role !== UserRole.ADMIN) {
            throw new ForbiddenException(
                'Only administrators can access this resource',
            );
        }

        return true;
    }
}
