import React, { createContext, useContext, useState } from 'react';
import { Button } from '@mantine/core';
import { IconUserPlus, IconUserX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify/unstyled';
import { IAccountSummary, IUserRequest } from '../type';
import { updateUserList } from '../api';
import { ConfirmDialog } from '../../../component/dialog/confirm_dialog';

// Context interface
export interface ActivateUserPluginContextValue {
    user: IAccountSummary;
    onUserStatusChange?: () => void;
}

// Context creation
export const ActivateUserPluginContext = createContext<ActivateUserPluginContextValue | undefined>(undefined);

// Custom hook for accessing context
export const useActivateUserPlugin = () => {
    const context = useContext(ActivateUserPluginContext);
    if (!context) {
        throw new Error('useActivateUserPlugin must be used within ActivateUserPluginProvider');
    }
    return context;
};

// Plugin props interface
export interface ActivateSingleUserPluginProps {
    size?: 'sm' | 'md' | 'lg';
    variant?: 'filled' | 'light' | 'outline';
}

// Main plugin component
export const ActivateSingleUserPlugin: React.FC<ActivateSingleUserPluginProps> = ({
    size = 'sm',
    variant = 'filled'
}) => {
    const { user, onUserStatusChange } = useActivateUserPlugin();
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Determine current status and action
    const isActive = user.status === 'ACTIVATED';
    const targetStatus = isActive ? 'INACTIVE' : 'ACTIVATED';
    const actionText = isActive ? t('Deactivate') : t('Activate');
    const confirmText = isActive ? t('deactivate') : t('activate');
    const Icon = isActive ? IconUserX : IconUserPlus;
    const buttonColor = isActive ? 'yellow' : 'aceBlue';

    // Handle status toggle
    const handleStatusToggle = async () => {
        if (!user) return;

        setIsLoading(true);
        
        const updatedUser: IUserRequest = {
            id: user.id,
            username: user.username,
            school: user.school?.schoolId || undefined,
            classGroups: user.classGroups.map((group) => group.classGroupId),
            status: targetStatus,
            grade: user.grade,
            contact: user.contact,
        };

        try {
            await updateUserList([updatedUser]);
            
            // Show success message
            const successMessage = isActive 
                ? t('User deactivated successfully')
                : t('User activated successfully');
            toast.success(successMessage);
            
            // Trigger callback to refresh user data
            onUserStatusChange?.();
            
        } catch (error) {
            console.error(`Error ${confirmText}ing user:`, error);
            const errorMessage = isActive
                ? t('Failed to deactivate user')
                : t('Failed to activate user');
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
            setIsModalOpen(false);
        }
    };

    return (
        <>
            <Button
                leftSection={<Icon size={16} />}
                onClick={() => setIsModalOpen(true)}
                variant={variant}
                color={buttonColor}
                size={size}
                loading={isLoading}
            >
                {actionText}
            </Button>

            <ConfirmDialog
                open={isModalOpen}
                handleClose={() => setIsModalOpen(false)}
                title={t('{{action}} {{username}}?', {
                    action: actionText,
                    username: user.username
                })}
                onSubmit={handleStatusToggle}
            />
        </>
    );
};
