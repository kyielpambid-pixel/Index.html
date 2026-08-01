import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Copy, Check, X, ChevronLeft } from 'lucide-react';

export default function LicenseKeyManager() {
  const [keys, setKeys] = useState(() => {
    const saved = localStorage.getItem('licenseKeys');
    return saved ? JSON.parse(saved) : [];
  });

  const [formData, setFormData] = useState({
    keyName: '',
    duration: '7d',
    maxPlayers: 1,
    quantityToGenerate: 1,
  });

  const [showForm, setShowForm] = useState(false);
  const [expandedKey, setExpandedKey] = useState(null);
  const [newPlayerName, setNewPlayerName] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    localStorage.setItem('licenseKeys', JSON.stringify(keys));
  }, [keys]);

  const generateKeyString = (prefix) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = prefix.toUpperCase();
    for (let i = 0; i < 3; i++) {
      let segment = '';
      for (let j = 0; j < 4; j++) {
        segment += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      result += '-' + segment;
    }
    return result;
  };

  const getExpirationDate = (duration) => {
    const now = new Date();
    const durMap = {
      '1d': 1,
      '1w': 7,
      '2w': 14,
      '3w': 21,
      '1m': 30,
      'perm': null,
    };
    
    if (durMap[duration] === null) return 'PERMANENT';
    
    const expDate = new Date(now.getTime() + durMap[duration] * 24 * 60 * 60 * 1000);
    return expDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleCreateKeys = () => {
    if (!formData.keyName.trim()) {
      alert('Please enter a key name');
      return;
    }

    const quantity = Math.min(Math.max(1, formData.quantityToGenerate), 1000);
    const newKeys = [];

    for (let i = 0; i < quantity; i++) {
      newKeys.push({
        id: Date.now() + i,
        name: formData.keyName.toUpperCase(),
        keyString: generateKeyString(formData.keyName),
        duration: formData.duration,
        expirationDate: getExpirationDate(formData.duration),
        createdAt: new Date().toLocaleDateString(),
        players: [],
        maxPlayers: formData.maxPlayers,
        isActive: true,
      });
    }

    setKeys([...keys, ...newKeys]);
    setFormData({ keyName: '', duration: '7d', maxPlayers: 1, quantityToGenerate: 1 });
    setShowForm(false);
    alert(`✅ Generated ${quantity} license key(s)!`);
  };

  const addPlayerToKey = (keyId) => {
    const playerName = newPlayerName[keyId]?.trim();
    if (!playerName) return;

    setKeys(keys.map(key => {
      if (key.id === keyId) {
        if (key.players.length >= key.maxPlayers) {
          alert(`Maximum ${key.maxPlayers} player(s) allowed`);
          return key;
        }
        return {
          ...key,
          players: [...key.players, { id: Date.now(), name: playerName }],
        };
      }
      return key;
    }));

    setNewPlayerName({ ...newPlayerName, [keyId]: '' });
  };

  const removePlayer = (keyId, playerId) => {
    setKeys(keys.map(key => {
      if (key.id === keyId) {
        return {
          ...key,
          players: key.players.filter(p => p.id !== playerId),
        };
      }
      return key;
    }));
  };

  const deleteKey = (keyId) => {
    if (confirm('Delete this key?')) {
      setKeys(keys.filter(k => k.id !== keyId));
    }
  };

  const revokeKey = (keyId) => {
    setKeys(keys.map(key => {
      if (key.id === keyId) {
        return { ...key, isActive: false };
      }
      return key;
    }));
  };

  const copyToClipboard = (text, keyId) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="sticky top-0 bg-slate-900/80 backdrop-blur p-4 border-b border-green-400/20">
        <div className="flex items-center justify-between mb-4">
          <button className="text-gray-400 hover:text-white transition">
            <X size={24} />
          </button>
          <h1 className="text-white font-bold text-lg">LicenseKeyManager.jsx</h1>
          <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
        </div>
        <p className="text-green-400 font-mono text-sm">
          Create, manage, and revoke license<br />keys with player tracking
        </p>
      </div>

      {/* Main Content */}
      <div className="p-4 pb-8">
        {/* Create Button */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full mb-6 bg-green-600/30 hover:bg-green-600/40 border-2 border-yellow-400 text-green-400 py-4 px-6 rounded-lg font-mono font-bold transition-all text-lg flex items-center justify-center gap-2"
        >
          <Plus size={24} />
          [ CREATE NEW KEY ]
        </button>

        {/* Create Form */}
        {showForm && (
          <div className="mb-6 p-5 border-2 border-green-400 rounded-lg bg-slate-900/80 backdrop-blur relative">
            {/* Collapse Arrow */}
            <button
              onClick={() => setShowForm(false)}
              className="absolute -right-4 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 rounded-full p-2 transition"
            >
              <ChevronLeft size={20} className="text-white" />
            </button>

            <h2 className="text-green-400 font-mono font-bold mb-5 text-lg">
              [ NEW LICENSE KEY ]
            </h2>
            
            <div className="space-y-5">
              {/* Key Name */}
              <div>
                <label className="text-green-400 font-mono text-sm mb-2 block font-bold">
                  KEY NAME / PREFIX
                </label>
                <input
                  type="text"
                  value={formData.keyName}
                  onChange={(e) => setFormData({ ...formData, keyName: e.target.value })}
                  placeholder="e.g., KHUB, PREMIUM, VIP"
                  className="w-full px-4 py-3 bg-slate-800 border-2 border-green-400 rounded-lg font-mono text-green-400 placeholder-green-400/40 focus:outline-none focus:border-green-300 text-base"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="text-green-400 font-mono text-sm mb-3 block font-bold">
                  DURATION
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['1d', '1w', '2w', '3w', '1m', 'perm'].map(dur => (
                    <button
                      key={dur}
                      onClick={() => setFormData({ ...formData, duration: dur })}
                      className={`py-3 px-3 rounded-lg font-mono font-bold text-base transition-all ${
                        formData.duration === dur
                          ? 'bg-green-500 text-slate-900 border-2 border-green-300'
                          : 'bg-slate-800 text-green-400 border-2 border-green-400/50 hover:border-green-400'
                      }`}
                    >
                      {dur}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Players */}
              <div>
                <label className="text-green-400 font-mono text-sm mb-2 block font-bold">
                  MAX PLAYERS
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxPlayers}
                  onChange={(e) => setFormData({ ...formData, maxPlayers: Math.max(1, parseInt(e.target.value)) })}
                  className="w-full px-4 py-3 bg-slate-800 border-2 border-green-400 rounded-lg font-mono text-green-400 focus:outline-none focus:border-green-300 text-base"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-green-400/30">
                <button
                  onClick={handleCreateKeys}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-slate-900 py-3 px-4 rounded-lg font-mono font-bold transition-all text-base"
                >
                  [ GENERATE ]
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-red-500/30 hover:bg-red-500/40 border-2 border-red-400 text-red-400 py-3 px-4 rounded-lg font-mono font-bold transition-all text-base"
                >
                  [ CANCEL ]
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Keys List */}
        <div className="space-y-3">
          {keys.length === 0 ? (
            <div className="p-6 border-2 border-green-400/30 rounded-lg text-center">
              <p className="text-green-400/50 font-mono text-sm">No license keys yet. Create one to get started!</p>
            </div>
          ) : (
            keys.map(key => (
              <div
                key={key.id}
                className={`border-2 rounded-lg transition-all ${
                  key.isActive
                    ? 'border-green-400 bg-slate-900/60'
                    : 'border-red-400 bg-slate-900/30'
                }`}
              >
                {/* Key Header */}
                <div
                  onClick={() => setExpandedKey(expandedKey === key.id ? null : key.id)}
                  className="p-4 cursor-pointer hover:bg-green-500/10 transition-all"
                >
                  <h3 className="text-green-400 font-mono font-bold text-base mb-1">
                    {key.name}
                  </h3>
                  <p className="text-green-300/60 font-mono text-xs mb-3">
                    {key.keyString}
                  </p>
                  <div className="flex justify-between text-xs">
                    <div>
                      <p className="text-green-400/60">EXPIRES</p>
                      <p className="text-green-400 font-bold">{key.expirationDate}</p>
                    </div>
                    <div>
                      <p className="text-green-400/60">PLAYERS</p>
                      <p className="text-green-400 font-bold">{key.players.length}/{key.maxPlayers}</p>
                    </div>
                    <div>
                      <p className={`font-bold text-xs ${key.isActive ? 'text-green-400' : 'text-red-400'}`}>
                        {key.isActive ? '● ACTIVE' : '● REVOKED'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Key Details */}
                {expandedKey === key.id && (
                  <div className="border-t-2 border-green-400 p-4 space-y-3">
                    {/* Copy Key */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={key.keyString}
                        className="flex-1 px-3 py-2 bg-slate-800 border-2 border-green-400/50 rounded font-mono text-green-400 text-xs"
                      />
                      <button
                        onClick={() => copyToClipboard(key.keyString, key.id)}
                        className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border-2 border-blue-400 text-blue-400 rounded font-mono font-bold transition-all"
                      >
                        {copiedKey === key.id ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>

                    {/* Players List */}
                    <div>
                      <h4 className="text-green-400 font-mono font-bold mb-2 text-xs">[ PLAYERS ]</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {key.players.length === 0 ? (
                          <p className="text-green-400/50 font-mono text-xs">No players assigned</p>
                        ) : (
                          key.players.map(player => (
                            <div key={player.id} className="flex items-center justify-between p-2 bg-slate-800 rounded border border-green-400/30">
                              <span className="text-green-400 font-mono text-xs">{player.name}</span>
                              <button
                                onClick={() => removePlayer(key.id, player.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Add Player */}
                    {key.isActive && key.players.length < key.maxPlayers && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newPlayerName[key.id] || ''}
                          onChange={(e) => setNewPlayerName({ ...newPlayerName, [key.id]: e.target.value })}
                          onKeyPress={(e) => e.key === 'Enter' && addPlayerToKey(key.id)}
                          placeholder="Player name..."
                          className="flex-1 px-3 py-2 bg-slate-800 border-2 border-green-400/50 rounded font-mono text-green-400 placeholder-green-400/30 focus:outline-none focus:border-green-400 text-xs"
                        />
                        <button
                          onClick={() => addPlayerToKey(key.id)}
                          className="px-3 py-2 bg-green-500/20 hover:bg-green-500/30 border-2 border-green-400 text-green-400 rounded font-mono font-bold transition-all"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-green-400/30">
                      {key.isActive ? (
                        <button
                          onClick={() => revokeKey(key.id)}
                          className="flex-1 bg-yellow-500/20 hover:bg-yellow-500/30 border-2 border-yellow-400 text-yellow-400 py-2 px-3 rounded font-mono font-bold transition-all text-xs"
                        >
                          [ REVOKE ]
                        </button>
                      ) : (
                        <div className="flex-1 py-2 px-3 bg-red-500/10 border-2 border-red-400 text-red-400 rounded font-mono font-bold text-center text-xs">
                          [ REVOKED ]
                        </div>
                      )}
                      <button
                        onClick={() => deleteKey(key.id)}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border-2 border-red-400 text-red-400 rounded font-mono font-bold transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Stats Footer */}
        {keys.length > 0 && (
          <div className="mt-6 p-4 border-2 border-green-400/30 rounded-lg bg-slate-900/50">
            <div className="grid grid-cols-4 gap-3 text-center text-xs">
              <div>
                <p className="text-green-400/60 font-mono">KEYS</p>
                <p className="text-green-400 font-mono font-bold text-lg">{keys.length}</p>
              </div>
              <div>
                <p className="text-green-400/60 font-mono">ACTIVE</p>
                <p className="text-green-400 font-mono font-bold text-lg">{keys.filter(k => k.isActive).length}</p>
              </div>
              <div>
                <p className="text-red-400/60 font-mono">REVOKED</p>
                <p className="text-red-400 font-mono font-bold text-lg">{keys.filter(k => !k.isActive).length}</p>
              </div>
              <div>
                <p className="text-green-400/60 font-mono">PLAYERS</p>
                <p className="text-green-400 font-mono font-bold text-lg">{keys.reduce((sum, k) => sum + k.players.length, 0)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
