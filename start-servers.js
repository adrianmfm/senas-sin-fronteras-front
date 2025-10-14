#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const { spawn, exec } = require('child_process');
const net = require('net');

// Función para verificar si un puerto está en uso
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.close(() => {
        resolve(false); // Puerto disponible
      });
    });
    
    server.on('error', () => {
      resolve(true); // Puerto en uso
    });
  });
}

// Función para terminar procesos en un puerto específico
function killProcessOnPort(port) {
  return new Promise((resolve) => {
    exec(`lsof -ti:${port}`, (error, stdout) => {
      if (error || !stdout.trim()) {
        resolve(); // No hay procesos en el puerto
        return;
      }
      
      const pids = stdout.trim().split('\n');
      let killPromises = pids.map(pid => {
        return new Promise((killResolve) => {
          exec(`kill -9 ${pid}`, () => killResolve());
        });
      });
      
      Promise.all(killPromises).then(() => {
        console.log(`✅ Procesos terminados en puerto ${port}`);
        setTimeout(resolve, 1000); // Esperar un poco antes de continuar
      });
    });
  });
}

async function startServers() {
  console.log('🚀 Iniciando servidores...\n');
  
  // Verificar y limpiar puerto 8080 (WebSocket)
  console.log('📡 Verificando puerto 8080 para WebSocket...');
  if (await isPortInUse(8080)) {
    console.log('⚠️  Puerto 8080 en uso, terminando procesos...');
    await killProcessOnPort(8080);
  }
  
  // Verificar y limpiar puerto 3000 (Next.js)
  console.log('🌐 Verificando puerto 3000 para Next.js...');
  if (await isPortInUse(3000)) {
    console.log('⚠️  Puerto 3000 en uso, terminando procesos...');
    await killProcessOnPort(3000);
  }
  
  console.log('\n🔄 Iniciando servidores...\n');
  
  // Iniciar servidor WebSocket
  console.log('📡 Iniciando servidor WebSocket en puerto 8080...');
  const wsServer = spawn('node', ['websocket-server.js'], {
    cwd: process.cwd(),
    stdio: ['inherit', 'pipe', 'pipe']
  });
  
  wsServer.stdout.on('data', (data) => {
    console.log(`[WebSocket] ${data.toString().trim()}`);
  });
  
  wsServer.stderr.on('data', (data) => {
    console.error(`[WebSocket Error] ${data.toString().trim()}`);
  });
  
  // Esperar un poco antes de iniciar Next.js
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Iniciar servidor Next.js
  console.log('🌐 Iniciando servidor Next.js en puerto 3000...');
  const nextServer = spawn('npm', ['run', 'dev'], {
    cwd: process.cwd(),
    stdio: ['inherit', 'pipe', 'pipe']
  });
  
  nextServer.stdout.on('data', (data) => {
    console.log(`[Next.js] ${data.toString().trim()}`);
  });
  
  nextServer.stderr.on('data', (data) => {
    console.error(`[Next.js Error] ${data.toString().trim()}`);
  });
  
  // Manejar cierre del script
  process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando servidores...');
    wsServer.kill('SIGTERM');
    nextServer.kill('SIGTERM');
    process.exit(0);
  });
  
  console.log('\n✅ Servidores iniciados:');
  console.log('📡 WebSocket: http://localhost:8080');
  console.log('🌐 Next.js: http://localhost:3000');
  console.log('\n📖 Rutas disponibles:');
  console.log('   👨‍⚕️ Doctor: http://localhost:3000/doctor');
  console.log('   🏥 Paciente: http://localhost:3000/patient');
  console.log('\n💡 Presiona Ctrl+C para detener ambos servidores\n');
}

startServers().catch(console.error);