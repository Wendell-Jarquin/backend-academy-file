import { NestFactory } from '@nestjs/core';
import { createServer } from 'node:net';
import { AppModule } from './app.module';

function canListenOnPort(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer();

    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });

    server.listen(port, '0.0.0.0');
  });
}

async function getAvailablePort(startPort: number): Promise<number> {
  let port = startPort;

  while (!(await canListenOnPort(port))) {
    port += 1;
  }

  return port;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const preferredPort = Number(process.env.PORT ?? 3454);

  const selectedPort = await getAvailablePort(preferredPort);
  await app.listen(selectedPort);

  if (selectedPort !== preferredPort) {
    console.warn(`Port ${preferredPort} in use, application started on ${selectedPort}`);
  }
}
bootstrap();
