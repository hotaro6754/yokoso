'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Download, Settings, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';

export default function BiometricAgentSetupGuide() {
  const [hasRead, setHasRead] = useState(false);
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    const raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    // Strip /api suffix — agent only needs the base URL
    setApiUrl(raw.replace(/\/api$/, ''));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Zodeck Biometric Agent Setup Guide</h1>
              <p className="text-gray-600">Complete guide to install and configure the biometric attendance agent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Quick Overview */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">What is the Biometric Agent?</h2>
          <p className="text-blue-800">
            The Zodeck Biometric Agent is a lightweight Windows application that runs on your office computer. 
            It automatically syncs attendance data from your local ZKTeco biometric device to the Zodeck HRMS cloud platform.
          </p>
        </div>

        {/* Step 1: Download */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold">1</div>
              <h2 className="text-xl font-semibold">Download the Latest Agent</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Where to Download:</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                  <li>Login to your Zodeck HRMS account</li>
                  <li>Navigate to <strong>HR → Attendance → Biometric</strong> tab</li>
                  <li>Click the <strong>"Download Latest"</strong> button in the blue card</li>
                  <li>Save the <code className="bg-gray-100 px-2 py-1 rounded">zodeck-agent.exe</code> file to your computer</li>
                </ol>
              </div>

              {/* Direct Download Button */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Quick Download</h3>
                    <p className="text-blue-100 text-sm">Get the latest Zodeck Biometric Agent</p>
                  </div>
                  <a
                    href={`${apiUrl}/api/agent/releases/latest/download`}
                    download
                    className="px-6 py-3 bg-white text-blue-700 font-bold rounded-lg hover:bg-blue-50 transition-all flex items-center gap-2 shadow-lg"
                  >
                    <Download className="w-5 h-5" />
                    Download Now
                  </a>
                </div>
                <p className="text-blue-100 text-xs mt-3">
                  Version: Latest | Size: ~52MB | Platform: Windows 7+
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-900">System Requirements:</p>
                    <ul className="text-yellow-800 text-sm mt-1 space-y-1">
                      <li>• Windows 7 or later (Windows 10/11 recommended)</li>
                      <li>• Network access to your biometric device</li>
                      <li>• Internet connection to sync with Zodeck cloud</li>
                      <li>• Administrator privileges for installation</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Screenshot Placeholder */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                <p className="text-gray-500 font-medium">📸 Screenshot: Download button location</p>
                <p className="text-sm text-gray-400 mt-1">(Screenshot will be added here)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Initial Setup */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white text-green-600 rounded-full flex items-center justify-center font-bold">2</div>
              <h2 className="text-xl font-semibold">Run Initial Setup</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">First Time Setup:</h3>
                <ol className="list-decimal list-inside space-y-3 text-gray-700 ml-4">
                  <li>
                    <strong>Double-click</strong> the <code className="bg-gray-100 px-2 py-1 rounded">zodeck-agent.exe</code> file
                  </li>
                  <li>
                    The agent will show an interactive menu. Select <strong>[1] Continue/Setup</strong>
                  </li>
                  <li>
                    You'll be guided through the configuration wizard
                  </li>
                </ol>
              </div>

              {/* Screenshot Placeholder */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                <p className="text-gray-500 font-medium">📸 Screenshot: Agent startup menu</p>
                <p className="text-sm text-gray-400 mt-1">(Screenshot will be added here)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Configuration */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white text-purple-600 rounded-full flex items-center justify-center font-bold">3</div>
              <h2 className="text-xl font-semibold">Configure Agent Settings</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              
              {/* API URL */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">1. API URL</h3>
                <p className="text-gray-700 mb-2">Enter your Zodeck HRMS API endpoint:</p>
                <div className="bg-gray-900 p-3 rounded border flex items-center justify-between gap-2">
                  <code className="text-green-400 text-sm break-all">{apiUrl || 'http://localhost:5000/api'}</code>
                  <button
                    onClick={() => navigator.clipboard.writeText(apiUrl || 'http://localhost:5000/api')}
                    className="text-xs bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600 flex-shrink-0"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  This is your Zodeck HRMS backend API URL. Copy and paste it exactly into the agent setup.
                </p>
              </div>

              {/* API Key */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">2. API Key</h3>
                <p className="text-gray-700 mb-2">Your unique authentication key:</p>
                <div className="bg-gray-50 p-3 rounded border">
                  <code className="text-sm">xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx</code>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Where to find:</strong> On the same Biometric page, click <strong>"Show API Key"</strong> 
                  button and copy the key.
                </p>
                <div className="bg-red-50 border border-red-200 rounded p-3 mt-2">
                  <p className="text-sm text-red-800">
                    <strong>⚠️ Important:</strong> Keep this key confidential. Do not share it with unauthorized users.
                  </p>
                </div>
              </div>

              {/* Device IP */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">3. Device IP Address</h3>
                <p className="text-gray-700 mb-2">Your biometric device's local network IP:</p>
                <div className="bg-gray-50 p-3 rounded border">
                  <code className="text-sm">192.168.1.100</code>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>How to find:</strong>
                </p>
                <ul className="text-sm text-gray-600 ml-4 mt-1 space-y-1">
                  <li>• Check your biometric device's display menu (usually under Network/Settings)</li>
                  <li>• Or contact your IT administrator</li>
                  <li>• Common format: 192.168.x.x or 10.0.x.x</li>
                </ul>
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-2">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ Common Mistake:</strong> Make sure it's <strong>192.168.x.x</strong> not 198.168.x.x
                  </p>
                </div>

                {/* Screenshot Placeholder - Device IP */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="border-2 border-dashed border-purple-200 rounded-lg p-5 text-center bg-purple-50">
                    <div className="text-3xl mb-2">📸</div>
                    <p className="text-purple-700 font-medium text-sm">Device Display Menu</p>
                    <p className="text-purple-500 text-xs mt-1">Screenshot: Network settings on ZKTeco device screen</p>
                  </div>
                  <div className="border-2 border-dashed border-purple-200 rounded-lg p-5 text-center bg-purple-50">
                    <div className="text-3xl mb-2">📸</div>
                    <p className="text-purple-700 font-medium text-sm">IP Address Location</p>
                    <p className="text-purple-500 text-xs mt-1">Screenshot: Where IP appears on device menu</p>
                  </div>
                </div>
              </div>

              {/* Device Port */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">4. Device Port</h3>
                <p className="text-gray-700 mb-2">Communication port (usually default):</p>
                <div className="bg-gray-50 p-3 rounded border">
                  <code className="text-sm">4370</code>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Default:</strong> 4370 (works for most ZKTeco devices)
                </p>
                <p className="text-sm text-gray-600">
                  Only change if your device uses a custom port.
                </p>
              </div>

              {/* Device Name */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">5. Device Name/ID</h3>
                <p className="text-gray-700 mb-2">A friendly name to identify this device:</p>
                <div className="bg-gray-50 p-3 rounded border">
                  <code className="text-sm">Main-Office-Entrance</code>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Examples:</strong> "Reception", "Main-Gate", "Office-Floor-2"
                </p>
                <p className="text-sm text-gray-600">
                  This helps identify which device the attendance came from if you have multiple devices.
                </p>
              </div>

              {/* Sync Interval */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">6. Sync Interval</h3>
                <p className="text-gray-700 mb-2">How often to check for new attendance (in seconds):</p>
                <div className="bg-gray-50 p-3 rounded border">
                  <code className="text-sm">300</code> <span className="text-gray-600">(5 minutes)</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Recommended:</strong> 300 seconds (5 minutes)
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Minimum:</strong> 60 seconds (1 minute)
                </p>
              </div>

              {/* Screenshot Placeholder */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                <p className="text-gray-500 font-medium">📸 Screenshot: Configuration wizard</p>
                <p className="text-sm text-gray-400 mt-1">(Screenshot will be added here)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Install as Service */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-4 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white text-orange-600 rounded-full flex items-center justify-center font-bold">4</div>
              <h2 className="text-xl font-semibold">Install as Windows Service (Optional but Recommended)</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <p className="text-gray-700">
                Installing as a Windows Service ensures the agent runs automatically when your computer starts, 
                even if no one is logged in.
              </p>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">To Install Service:</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                  <li>From the agent menu, select <strong>[S] Service</strong></li>
                  <li>Choose <strong>Install Service</strong></li>
                  <li>The agent will install itself as "ZodeckBiometricAgent" service</li>
                  <li>Service will start automatically on system boot</li>
                </ol>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">Benefits of Service Mode:</p>
                    <ul className="text-green-800 text-sm mt-1 space-y-1">
                      <li>✓ Runs automatically on startup</li>
                      <li>✓ No need to manually start the agent</li>
                      <li>✓ Continues running even if user logs out</li>
                      <li>✓ More reliable for 24/7 operation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 5: Verify */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-4 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white text-teal-600 rounded-full flex items-center justify-center font-bold">5</div>
              <h2 className="text-xl font-semibold">Verify Setup</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Check if Agent is Working:</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                  <li>The agent console should show: <code className="bg-gray-100 px-2 py-1 rounded">[INFO] Agent running</code></li>
                  <li>Go to Zodeck HRMS → <strong>HR → Attendance → Biometric</strong></li>
                  <li>You should see the agent status as <strong>"Connected"</strong></li>
                  <li>Test by punching attendance on the device</li>
                  <li>Wait for the sync interval (5 minutes by default)</li>
                  <li>Check if attendance appears in the Attendance page</li>
                </ol>
              </div>

              {/* Screenshot Placeholder */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                <p className="text-gray-500 font-medium">📸 Screenshot: Agent running successfully</p>
                <p className="text-sm text-gray-400 mt-1">(Screenshot will be added here)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 rounded-t-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Troubleshooting Common Issues</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              
              {/* Issue 1 */}
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">❌ "Device connection failed"</h3>
                <p className="text-gray-700 mb-2"><strong>Possible causes:</strong></p>
                <ul className="text-gray-700 space-y-1 ml-4">
                  <li>• Wrong IP address (check device display menu)</li>
                  <li>• Device is powered off or disconnected from network</li>
                  <li>• Firewall blocking port 4370</li>
                  <li>• Computer and device on different networks</li>
                </ul>
                <p className="text-gray-700 mt-2"><strong>Solutions:</strong></p>
                <ul className="text-gray-700 space-y-1 ml-4">
                  <li>• Verify device IP: Go to device menu → Network → IP Address</li>
                  <li>• Test connection: Open Command Prompt, type <code className="bg-gray-100 px-2 py-1 rounded">ping 192.168.x.x</code></li>
                  <li>• Check firewall: Allow port 4370 in Windows Firewall</li>
                  <li>• Ensure both are on same network/VLAN</li>
                </ul>
              </div>

              {/* Issue 2 */}
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">❌ "Cloud sync failed" or "API error"</h3>
                <p className="text-gray-700 mb-2"><strong>Possible causes:</strong></p>
                <ul className="text-gray-700 space-y-1 ml-4">
                  <li>• Wrong API URL or API Key</li>
                  <li>• No internet connection</li>
                  <li>• Zodeck server is down (rare)</li>
                </ul>
                <p className="text-gray-700 mt-2"><strong>Solutions:</strong></p>
                <ul className="text-gray-700 space-y-1 ml-4">
                  <li>• Double-check API URL and Key from Zodeck portal</li>
                  <li>• Test internet: Open browser, visit https://zodeck.com</li>
                  <li>• Reconfigure agent with correct credentials</li>
                </ul>
              </div>

              {/* Issue 3 */}
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">❌ "No new attendance records"</h3>
                <p className="text-gray-700 mb-2"><strong>Possible causes:</strong></p>
                <ul className="text-gray-700 space-y-1 ml-4">
                  <li>• No new punches since last sync</li>
                  <li>• Sync interval hasn't elapsed yet</li>
                  <li>• Device clock is wrong (future date)</li>
                </ul>
                <p className="text-gray-700 mt-2"><strong>Solutions:</strong></p>
                <ul className="text-gray-700 space-y-1 ml-4">
                  <li>• Test with a fresh punch on the device</li>
                  <li>• Wait for sync interval (default 5 minutes)</li>
                  <li>• Or use "Synchronize Now" button in Zodeck portal</li>
                  <li>• Check device date/time settings</li>
                </ul>
              </div>

            </div>
          </div>
        </div>

        {/* Reconfigure/Reset */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-6 py-4 rounded-t-lg">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Reconfigure or Reset Agent</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">To Change Settings:</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                  <li>Stop the agent (press Ctrl+C or stop the service)</li>
                  <li>Double-click <code className="bg-gray-100 px-2 py-1 rounded">zodeck-agent.exe</code></li>
                  <li>Select <strong>[2] Reconfigure</strong> from the menu</li>
                  <li>Update the settings you want to change</li>
                  <li>Restart the agent</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">To Completely Reset:</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                  <li>Stop the agent</li>
                  <li>Double-click <code className="bg-gray-100 px-2 py-1 rounded">zodeck-agent.exe</code></li>
                  <li>Select <strong>[3] Reset</strong> from the menu</li>
                  <li>This will delete all configuration and data</li>
                  <li>Run setup again from scratch</li>
                </ol>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Note:</strong> Reset will delete the offline queue and sync history. 
                  Only use if you're having persistent issues.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Update Guide */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-4 rounded-t-lg">
            <div className="flex items-center gap-3">
              <Download className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Updating the Agent</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <p className="text-gray-700">
                The agent automatically checks for updates when it starts. If a new version is available, 
                you'll see a notification in the console.
              </p>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">To Update Manually:</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                  <li>Download the latest version from Zodeck portal</li>
                  <li>Stop the current agent (or uninstall service)</li>
                  <li>Replace the old <code className="bg-gray-100 px-2 py-1 rounded">zodeck-agent.exe</code> with the new one</li>
                  <li>Your configuration is preserved (stored separately)</li>
                  <li>Start the agent again</li>
                </ol>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <strong>✓ Good News:</strong> Your configuration (API keys, device settings) is stored separately 
                  and won't be lost when updating the agent.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration File Location */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="bg-gray-100 px-6 py-4 rounded-t-lg border-b">
            <h2 className="text-lg font-semibold text-gray-900">Advanced: Configuration File Location</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-700 mb-3">
              The agent stores its configuration and data in:
            </p>
            <div className="bg-gray-50 p-4 rounded border font-mono text-sm">
              C:\ProgramData\Zodeck HRMS Agent\
            </div>
            <p className="text-gray-600 text-sm mt-3">
              Files stored here:
            </p>
            <ul className="text-gray-600 text-sm ml-4 mt-2 space-y-1">
              <li>• <code>config.json</code> - Your configuration settings</li>
              <li>• <code>queue.json</code> - Offline sync queue</li>
              <li>• <code>synced_hashes.json</code> - Duplicate prevention data</li>
              <li>• <code>agent.log</code> - Activity logs</li>
            </ul>
          </div>
        </div>

        {/* Confirmation Checkbox */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <input
              type="checkbox"
              id="hasRead"
              checked={hasRead}
              onChange={(e) => setHasRead(e.target.checked)}
              className="w-5 h-5 mt-1 rounded border-white"
            />
            <label htmlFor="hasRead" className="text-white cursor-pointer">
              <p className="font-semibold text-lg">I have read and understood this guide</p>
              <p className="text-blue-100 text-sm mt-1">
                Check this box to confirm you've reviewed the setup instructions and are ready to proceed.
              </p>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <a
            href="/hr/attendance?tab=biometric"
            className={`px-8 py-3 rounded-lg font-semibold transition-all ${
              hasRead
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={(e) => {
              if (!hasRead) {
                e.preventDefault();
                alert('Please confirm that you have read the guide before proceeding.');
              }
            }}
          >
            Proceed to Add Biometric Device
          </a>
          
          <button
            onClick={() => window.print()}
            className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
          >
            Print This Guide
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t">
          <p className="text-gray-600">
            Need help? Contact support at <a href="mailto:support@zodeck.com" className="text-blue-600 hover:underline">support@zodeck.com</a>
          </p>
          <p className="text-gray-500 text-sm mt-2">
            © 2026 Zodeck Technologies. All Rights Reserved.
          </p>
        </div>

      </div>
    </div>
  );
}
