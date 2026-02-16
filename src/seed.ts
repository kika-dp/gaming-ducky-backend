import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AdminService } from './modules/admin/admin.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const adminService = app.get(AdminService);

  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  console.log(`Checking/Creating admin user: ${username}`);

  try {
    const admin = await adminService.createInitialAdmin(username, password);
    if (admin) {
      console.log('Admin created successfully');
    } else {
      console.log('Admin already exists');
    }
  } catch (error) {
    console.error('Error seeding admin', error);
  } finally {
    await app.close();
  }
}
bootstrap();
