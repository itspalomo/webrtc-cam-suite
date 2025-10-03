'use client';

import { motion } from 'framer-motion';
import {
  Wifi,
  Activity,
  Eye,
  Clock,
  Zap,
  AlertTriangle,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { StreamStats } from '@/types';

/**
 * PlayerStatsHUD displays real-time streaming statistics
 * Shows latency, bitrate, resolution, fps, and packet loss
 */
interface PlayerStatsHUDProps {
  stats: StreamStats;
  isVisible: boolean;
  className?: string;
  compact?: boolean;
  onToggleCompact?: () => void;
}

export function PlayerStatsHUD({
  stats,
  isVisible,
  className = '',
  compact = false,
  onToggleCompact,
}: PlayerStatsHUDProps) {
  if (!isVisible || Object.keys(stats).length === 0) {
    return null;
  }

  const formatBitrate = (bitrate?: number): string => {
    if (!bitrate) return '--';
    if (bitrate >= 1000) {
      return `${(bitrate / 1000).toFixed(1)} Mbps`;
    }
    return `${bitrate.toFixed(0)} kbps`;
  };

  const formatLatency = (latency?: number): string => {
    if (!latency) return '--';
    return `${latency.toFixed(0)}ms`;
  };

  const getLatencyColor = (latency?: number): string => {
    if (!latency) return 'text-gray-400';
    if (latency < 50) return 'text-green-400';
    if (latency < 150) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPacketLossColor = (packetLoss?: number): string => {
    if (!packetLoss) return 'text-gray-400';
    if (packetLoss < 1) return 'text-green-400';
    if (packetLoss < 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const compactStats = (
    <div className="flex items-center space-x-3 text-xs">
      {stats.latency && (
        <div className={`flex items-center space-x-1 ${getLatencyColor(stats.latency)}`}>
          <Clock className="h-3 w-3" />
          <span>{formatLatency(stats.latency)}</span>
        </div>
      )}
      {stats.bitrate && (
        <div className="flex items-center space-x-1 text-blue-400">
          <Zap className="h-3 w-3" />
          <span>{formatBitrate(stats.bitrate)}</span>
        </div>
      )}
      {stats.fps && (
        <div className="flex items-center space-x-1 text-purple-400">
          <Eye className="h-3 w-3" />
          <span>{stats.fps}fps</span>
        </div>
      )}
      {stats.packetLoss && stats.packetLoss > 0 && (
        <div className={`flex items-center space-x-1 ${getPacketLossColor(stats.packetLoss)}`}>
          <AlertTriangle className="h-3 w-3" />
          <span>{stats.packetLoss.toFixed(1)}%</span>
        </div>
      )}
    </div>
  );

  const fullStats = (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2 text-xs">
        {stats.latency && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3 text-gray-400" />
              <span className="text-gray-300">Latency</span>
            </div>
            <span className={`font-mono ${getLatencyColor(stats.latency)}`}>
              {formatLatency(stats.latency)}
            </span>
          </div>
        )}

        {stats.bitrate && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Zap className="h-3 w-3 text-gray-400" />
              <span className="text-gray-300">Bitrate</span>
            </div>
            <span className="font-mono text-blue-400">
              {formatBitrate(stats.bitrate)}
            </span>
          </div>
        )}

        {stats.resolution && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Activity className="h-3 w-3 text-gray-400" />
              <span className="text-gray-300">Resolution</span>
            </div>
            <span className="font-mono text-green-400">{stats.resolution}</span>
          </div>
        )}

        {stats.fps && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3 text-gray-400" />
              <span className="text-gray-300">FPS</span>
            </div>
            <span className="font-mono text-purple-400">{stats.fps}</span>
          </div>
        )}

        {stats.codec && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Wifi className="h-3 w-3 text-gray-400" />
              <span className="text-gray-300">Codec</span>
            </div>
            <span className="font-mono text-cyan-400">{stats.codec}</span>
          </div>
        )}

        {stats.packetLoss !== undefined && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <AlertTriangle className="h-3 w-3 text-gray-400" />
              <span className="text-gray-300">Packet Loss</span>
            </div>
            <span className={`font-mono ${getPacketLossColor(stats.packetLoss)}`}>
              {stats.packetLoss.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={className}
      data-testid="stats-hud"
    >
      <Card className="bg-black/80 backdrop-blur-sm border-gray-700 text-white min-w-[200px]">
        <div className="p-3">
          {/* Header with toggle */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium">Stream Stats</span>
            </div>
            {onToggleCompact && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCompact}
                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
              >
                {compact ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronUp className="h-3 w-3" />
                )}
              </Button>
            )}
          </div>

          {/* Stats content */}
          {compact ? compactStats : fullStats}

          {/* Connection quality indicator */}
          <div className="mt-2 pt-2 border-t border-gray-700">
            <div className="flex items-center justify-center space-x-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  stats.latency && stats.latency < 100 ? 'bg-green-400' :
                  stats.latency && stats.latency < 200 ? 'bg-yellow-400' :
                  'bg-red-400'
                }`}
              />
              <Badge
                variant="outline"
                className="text-xs border-gray-600 text-gray-300"
              >
                {stats.latency && stats.latency < 100 ? 'Excellent' :
                 stats.latency && stats.latency < 200 ? 'Good' :
                 stats.latency ? 'Poor' : 'Unknown'}
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
