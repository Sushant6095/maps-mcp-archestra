#!/usr/bin/env node

/**
 * Simple test - just verify server starts and responds to list tools
 */

import { spawn } from 'child_process';

console.log('🧪 Testing MCP Server...\n');

const server = spawn('node', ['dist/server.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
});

// Send list tools request
const request = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list',
  params: {},
};

console.log('📤 Sending: tools/list request');
server.stdin.write(JSON.stringify(request) + '\n');

// Listen for response
let output = '';
server.stdout.on('data', (data) => {
  output += data.toString();
  const lines = output.split('\n').filter((l) => l.trim());
  
  for (const line of lines) {
    try {
      const response = JSON.parse(line);
      if (response.result && response.result.tools) {
        console.log(`\n✅ SUCCESS! Server is working!`);
        console.log(`📊 Found ${response.result.tools.length} tools:`);
        response.result.tools.forEach((tool) => {
          console.log(`   ✓ ${tool.name}`);
        });
        console.log('\n🎉 Your MCP server is ready!');
        server.kill();
        process.exit(0);
      }
    } catch (e) {
      // Not JSON, continue
    }
  }
});

server.stderr.on('data', (data) => {
  const msg = data.toString();
  if (msg.includes('running on stdio')) {
    console.log('✅ Server started successfully');
  }
});

// Timeout after 5 seconds
setTimeout(() => {
  console.log('\n❌ Timeout - server did not respond');
  server.kill();
  process.exit(1);
}, 5000);

server.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.log(`\n❌ Server exited with code ${code}`);
    process.exit(1);
  }
});
