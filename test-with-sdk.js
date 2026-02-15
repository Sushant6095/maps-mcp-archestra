#!/usr/bin/env node

/**
 * Test MCP server using the MCP SDK client
 * This properly handles the initialization protocol
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

async function testServer() {
  console.log('🧪 Testing MCP Server with SDK Client...\n');

  // Spawn the server process
  const serverProcess = spawn('node', ['dist/server.js'], {
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  // Create transport
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['dist/server.js'],
    env: process.env,
  });

  try {
    // Create client
    const client = new Client(
      {
        name: 'test-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    // Connect
    await client.connect(transport);
    console.log('✅ Connected to server\n');

    // Test 1: List tools
    console.log('📋 Test 1: Listing tools...');
    const toolsResponse = await client.listTools();
    console.log(`✅ Found ${toolsResponse.tools.length} tools:`);
    toolsResponse.tools.forEach((tool) => {
      console.log(`   ✓ ${tool.name}: ${tool.description.substring(0, 50)}...`);
    });

    // Test 2: Call get_saved_places
    console.log('\n📋 Test 2: Calling get_saved_places...');
    const placesResponse = await client.callTool({
      name: 'get_saved_places',
      arguments: { limit: 3 },
    });

    if (placesResponse.content && placesResponse.content[0]) {
      const data = JSON.parse(placesResponse.content[0].text);
      console.log(`✅ Got ${Array.isArray(data) ? data.length : 1} place(s)`);
      if (Array.isArray(data) && data.length > 0) {
        console.log(`   First place: ${data[0].name}`);
      }
    }

    // Test 3: Call get_insights
    console.log('\n📋 Test 3: Calling get_insights...');
    const insightsResponse = await client.callTool({
      name: 'get_insights',
      arguments: {},
    });

    if (insightsResponse.content && insightsResponse.content[0]) {
      const data = JSON.parse(insightsResponse.content[0].text);
      console.log(`✅ Got insights:`);
      console.log(`   Total places: ${data.totalPlaces || 'N/A'}`);
      console.log(`   Average rating: ${data.averageRating || 'N/A'}`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 All tests passed! Server is working correctly!');
    console.log('='.repeat(50));

    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

testServer();
