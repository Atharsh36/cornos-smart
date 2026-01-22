import { useAccount, useSwitchChain } from 'wagmi';
import { cronosTestnet } from 'wagmi/chains';
import { Globe, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function NetworkSwitcher() {
  const { chainId, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isConnected || chainId === cronosTestnet.id || isDismissed) {
    return null;
  }

  const handleSwitchNetwork = async () => {
    try {
      await switchChain({ chainId: cronosTestnet.id });
      toast.success('Switched to Cronos Testnet');
    } catch (error) {
      // If switching fails, try adding the network
      if (window.ethereum) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x152', // 338 in hex
              chainName: 'Cronos Testnet',
              rpcUrls: ['https://evm-t3.cronos.org'],
              nativeCurrency: {
                name: 'CRO',
                symbol: 'CRO',
                decimals: 18
              },
              blockExplorerUrls: ['https://cronos.org/explorer/testnet3']
            }]
          });
          toast.success('Cronos Testnet added to wallet');
        } catch (addError) {
          toast.error('Failed to switch network');
        }
      }
    }
  };

  return (
    <div className="bg-orange-600 text-white px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Globe className="w-5 h-5" />
        <div>
          <span className="font-medium">Wrong Network</span>
          <span className="ml-2 text-orange-100">Switch to Cronos Testnet to use all features</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleSwitchNetwork}
          className="px-4 py-1 bg-white text-orange-600 rounded font-medium hover:bg-orange-50 transition-colors"
        >
          Switch Network
        </button>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 hover:bg-orange-700 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}