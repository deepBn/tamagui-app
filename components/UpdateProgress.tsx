import React, { useEffect, useState } from 'react'
import { useUpdates } from 'expo-updates'
import * as Updates from 'expo-updates'
import { View, Button, XStack, YStack, Text, Progress, useTheme } from 'tamagui'
import { Download, RefreshCw } from '@tamagui/lucide-icons'

interface UpdateProgressProps {
  onReload?: () => void
}

export const UpdateProgress: React.FC<UpdateProgressProps> = ({ onReload }) => {
  const {
    currentlyRunning,
    isUpdateAvailable,
    isUpdatePending,
    checkError,
    downloadError,
    isDownloading,
    downloadedUpdate,
  } = useUpdates()

  const [downloadProgress, setDownloadProgress] = useState(0)
  const [isDownloadComplete, setIsDownloadComplete] = useState(false)
  const [showUpdateBar, setShowUpdateBar] = useState(false)
  const [isCheckingForUpdates, setIsCheckingForUpdates] = useState(false)

  // Check for updates and show the bar if an update is available
  useEffect(() => {
    if (isUpdateAvailable || isUpdatePending || isDownloading || downloadedUpdate) {
      setShowUpdateBar(true)
    }
  }, [isUpdateAvailable, isUpdatePending, isDownloading, downloadedUpdate])

  // Auto check for updates on mount (only in production builds)
  useEffect(() => {
    const checkForUpdates = async () => {
      if (__DEV__) {
        // In development, show a test state
        setShowUpdateBar(true)
        setIsCheckingForUpdates(true)
        setTimeout(() => {
          setIsCheckingForUpdates(false)
        }, 2000)
        return
      }
      
      try {
        setIsCheckingForUpdates(true)
        await Updates.checkForUpdateAsync()
      } catch (error) {
        console.error('Error checking for updates:', error)
      } finally {
        setIsCheckingForUpdates(false)
      }
    }

    checkForUpdates()
  }, [])

  // Manual check for updates
  const handleCheckForUpdates = async () => {
    try {
      setIsCheckingForUpdates(true)
      await Updates.checkForUpdateAsync()
    } catch (error) {
      console.error('Error checking for updates:', error)
    } finally {
      setIsCheckingForUpdates(false)
    }
  }

  // Handle download completion
  useEffect(() => {
    if (downloadedUpdate && !isDownloading) {
      setIsDownloadComplete(true)
      setDownloadProgress(100)
    }
  }, [downloadedUpdate, isDownloading])

  // Monitor download progress
  useEffect(() => {
    if (isDownloading) {
      const interval = setInterval(() => {
        // Simulate progress for now since we can't track real progress
        setDownloadProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.random() * 10
        })
      }, 200)

      return () => clearInterval(interval)
    }
  }, [isDownloading])

  // Start download when update is available
  const handleDownload = async () => {
    if (isUpdateAvailable && !isDownloading) {
      try {
        setDownloadProgress(0)
        await Updates.fetchUpdateAsync()
      } catch (error) {
        console.error('Error downloading update:', error)
      }
    }
  }

  // Handle reload
  const handleReload = async () => {
    try {
      if (onReload) {
        onReload()
      }
      await Updates.reloadAsync()
    } catch (error) {
      console.error('Error reloading app:', error)
    }
  }

  // Don't render anything if no update activity and not checking
  if (!showUpdateBar && !isCheckingForUpdates) {
    return null
  }

  return (
    <YStack
      position="absolute"
      b={100}
      l={0}
      r={0}
      background="$background"
      borderTopWidth={1}
      borderTopColor="$borderColor"
      px="$4"
      py="$4"
      gap="$3"
    >
      {/* Checking for Updates State */}
      {isCheckingForUpdates && !isUpdateAvailable && (
        <XStack items="center" gap="$2">
          <Text fontSize="$3" color="$color">
            Checking for updates...
          </Text>
        </XStack>
      )}

      {/* Update Available State */}
      {isUpdateAvailable && !isDownloading && !isDownloadComplete && (
        <XStack items="center" justify="space-between">
          <XStack items="center" gap="$2" flex={1}>
            <Download size={16} color="$blue10" />
            <Text fontSize="$3" color="$color">
              App update available
            </Text>
          </XStack>
          <Button
            size="$2"
            theme="blue"
            onPress={handleDownload}
            icon={Download}
          >
            Download
          </Button>
        </XStack>
      )}

      {/* Downloading State */}
      {isDownloading && (
        <YStack gap="$2">
          <XStack items="center" justify="space-between">
            <Text fontSize="$3" color="$color">
              Downloading update...
            </Text>
            <Text fontSize="$2" color="$color11">
              {Math.round(downloadProgress)}%
            </Text>
          </XStack>
          <Progress
            value={downloadProgress}
            background="$background"
            borderColor="$borderColor"
            borderWidth={1}
          >
            <Progress.Indicator background="$blue10" />
          </Progress>
        </YStack>
      )}

      {/* Download Complete State */}
      {isDownloadComplete && downloadedUpdate && (
        <XStack items="center" justify="space-between">
          <XStack items="center" gap="$2" flex={1}>
            <RefreshCw size={16} color="$green10" />
            <Text fontSize="$3" color="$color">
              Update ready to install
            </Text>
          </XStack>
          <Button
            size="$2"
            theme="green"
            onPress={handleReload}
            icon={RefreshCw}
          >
            Reload
          </Button>
        </XStack>
      )}

      {/* Error States */}
      {(checkError || downloadError) && (
        <XStack items="center" gap="$2">
          <Text fontSize="$3" color="$red10">
            Update error: {checkError?.message || downloadError?.message}
          </Text>
        </XStack>
      )}

    </YStack>
  )
}
