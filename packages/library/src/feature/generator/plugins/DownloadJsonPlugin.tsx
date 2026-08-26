import React, { createContext, useContext } from 'react';
import { Button } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify/unstyled';
import { IExerciseContentJsonData } from '@acessment/generator-panel';

// Context interface
export interface DownloadJsonPluginContextValue {
    // Single exercise data
    currentExercise: IExerciseContentJsonData;
    
    // Multiple exercises support
    allExercises?: IExerciseContentJsonData[];
    currentExerciseIndex?: number;
    
    // Additional metadata
    selectedCategory?: string;
    articleScript?: string;
    
    // Helper functions
    updateCurrentExerciseInArray?: () => IExerciseContentJsonData[];
}

// Context creation
export const DownloadJsonPluginContext = createContext<DownloadJsonPluginContextValue | undefined>(undefined);

// Custom hook for accessing context
export const useDownloadJsonPlugin = () => {
    const context = useContext(DownloadJsonPluginContext);
    if (!context) {
        throw new Error('useDownloadJsonPlugin must be used within DownloadJsonPluginProvider');
    }
    return context;
};

// Plugin props interface
export interface DownloadJsonPluginProps {
    downloadMode?: 'current' | 'all';
    fileName?: string;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

// Helper function to download JSON file
const downloadJsonFile = (data: IExerciseContentJsonData | IExerciseContentJsonData[], fileName: string) => {
    try {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        return true;
    } catch (error) {
        console.error('Error downloading JSON file:', error);
        return false;
    }
};

// Main plugin component
export const DownloadJsonPlugin: React.FC<DownloadJsonPluginProps> = ({
    downloadMode = 'current',
    fileName,
    size = 'xs',
    showLabel = true
}) => {
    const { 
        currentExercise, 
        allExercises, 
        currentExerciseIndex, 
        selectedCategory, 
        updateCurrentExerciseInArray 
    } = useDownloadJsonPlugin();
    const { t } = useTranslation();

    // Generate filename with timestamp and category
    const generateFileName = (mode: 'current' | 'all'): string => {
        if (fileName) return fileName;
        
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        
        if (mode === 'all' && allExercises && allExercises.length > 1) {
            return `exercises_${allExercises.length}_${timestamp}.json`;
        } else {
            const index = currentExerciseIndex !== undefined ? `_${currentExerciseIndex + 1}` : '';
            return `exercise_${index}_${timestamp}.json`;
        }
    };

    // Download current exercise
    const downloadCurrentExercise = () => {
        if (!currentExercise || Object.keys(currentExercise).length === 0) {
            toast.error(t('No exercise data available to download'));
            return;
        }

        const filename = generateFileName('current');
        const success = downloadJsonFile(currentExercise, filename);
        
        if (success) {
            toast.success(t('Exercise JSON downloaded successfully'));
        } else {
            toast.error(t('Failed to download exercise JSON'));
        }
    };

    // Download all exercises
    const downloadAllExercises = () => {
        // Get the most up-to-date exercises array
        const updatedExercises = updateCurrentExerciseInArray?.() || allExercises || [currentExercise];
        
        if (!updatedExercises || updatedExercises.length === 0) {
            toast.error(t('No exercises available to download'));
            return;
        }

        // Filter out empty exercises
        const validExercises = updatedExercises.filter(exercise => 
            exercise && Object.keys(exercise).length > 0
        );

        if (validExercises.length === 0) {
            toast.error(t('No valid exercises to download'));
            return;
        }

        const filename = generateFileName('all');
        const dataToDownload = validExercises.length === 1 ? validExercises[0] : validExercises;
        const success = downloadJsonFile(dataToDownload, filename);
        
        if (success) {
            const message = validExercises.length === 1 
                ? t('Exercise JSON downloaded successfully')
                : t('{{count}} exercises downloaded successfully', { count: validExercises.length });
            toast.success(message);
        } else {
            toast.error(t('Failed to download exercises JSON'));
        }
    };

    // Handle download click
    const handleDownload = () => {
        if (downloadMode === 'current') {
            downloadCurrentExercise();
        } else {
            downloadAllExercises();
        }
    };

    // Determine button text
    const getButtonText = () => {
        if (!showLabel) return '';
        
        if (downloadMode === 'all' && allExercises && allExercises.length > 1) {
            return t('Download All JSON ({{count}})', { count: allExercises.length });
        } else {
            return t('Download JSON');
        }
    };

    return (
        <Button
            leftSection={<IconDownload size={16} />}
            onClick={handleDownload}
            variant="light"
            color="aceBlue"
            size={size}
        >
            {getButtonText()}
        </Button>
    );
};