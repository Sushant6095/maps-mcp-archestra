#!/usr/bin/env node

/**
 * Test script to verify MCP server is working correctly
 * This simulates MCP protocol messages to test the server
 */

import { spawn } from 'child_process';
import * as readline from 'readline';

const serverProcess = spawn('node', ['dist/server.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let requestId = 1;

// Helper to send MCP request
function sendRequest(method, params = {}) {
  const request = {
    jsonrpc: '2.0',
    id: requestId++,
    method,
    params,
  };

  const message = JSON.stringify(request) + '\n';
  console.log('\n📤 Sending request:', JSON.stringify(request, null, 2));
  serverProcess.stdin.write(message);
}

// Listen to server responses
serverProcess.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter((line) => line.trim());
  
  lines.forEach((line) => {
    try {
      const response = JSON.parse(line);
      console.log('\n📥 Server response:', JSON.stringify(response, null, 2));
      
      if (response.result) {
        if (response.result.tools) {
          console.log(`\n✅ Found ${response.result.tools.length} tools available!`);
          response.result.tools.forEach((tool) => {
            console.log(`   - ${tool.name}: ${tool.description}`);
          });
        } else if (response.result.content) {
          const content = response.result.content[0];
          if (content.type === 'text') {
            try {
              const data = JSON.parse(content.text);
              console.log(`\n✅ Tool returned ${Array.isArray(data) ? data.length : 1} result(s)`);
              if (Array.isArray(data) && data.length > 0) {
                console.log(`   First result: ${JSON.stringify(data[0], null, 2)}`);
              } else if (!Array.isArray(data)) {
                console.log(`   Result: ${JSON.stringify(data, null, 2)}`);
              }
            } catch (e) {
              console.log(`\n✅ Tool returned text response`);
            }
          }
        }
      }
    } catch (e) {
      // Not JSON, might be error output
      if (line.trim()) {
        console.log('📝 Server log:', line);
      }
    }
  });
});

serverProcess.stderr.on('data', (data) => {
  console.log('⚠️  Server stderr:', data.toString());
});

serverProcess.on('exit', (code) => {
  console.log(`\n❌ Server exited with code ${code}`);
  process.exit(code);
});

// Wait a bit for server to start
setTimeout(() => {
  console.log('🧪 Testing MCP Server...\n');
  console.log('='.repeat(50));

  // Test 1: List tools
  console.log('\n📋 Test 1: Listing available tools...');
  sendRequest('tools/list');

  // Test 2: Call a tool (get_saved_places)
  setTimeout(() => {
    console.log('\n📋 Test 2: Calling get_saved_places tool...');
    sendRequest('tools/call', {
      name: 'get_saved_places',
      arguments: {
        limit: 5,
      },
    });
  }, 1000);

  // Test 3: Call search tool
  setTimeout(() => {
    console.log('\n📋 Test 3: Calling search_saved_places tool...');
    sendRequest('tools/call', {
      name: 'search_saved_places',
      arguments: {
        query: 'beach',
        limit: 3,
      },
    });
  }, 2000);

  // Test 4: Call insights tool
  setTimeout(() => {
    console.log('\n📋 Test 4: Calling get_insights tool...');
    sendRequest('tools/call', {
      name: 'get_insights',
      arguments: {},
    });
  }, 3000);

  // Exit after tests
  setTimeout(() => {
    console.log('\n' + '='.repeat(50));
    console.log('✅ Tests completed!');
    console.log('\nIf you see tool responses above, your MCP server is working correctly!');
    serverProcess.kill();
    process.exit(0);
  }, 5000);
}, 500);
