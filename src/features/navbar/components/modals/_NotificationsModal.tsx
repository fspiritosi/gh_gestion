'use client';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { BellIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { deleteAllNotifications, deleteNotification } from '../../actions/actions.navbar';
import { NotificationsModalProps } from '../../types/navbar.types';
import { _NotificationItem } from '../ui/_NotificationItem';

export function _NotificationsModal({ notifications }: NotificationsModalProps) {
  const [open, setOpen] = useState(false);

  const handleDeleteAll = async () => {
    await deleteAllNotifications();
    setOpen(false);
  };

  const handleDeleteOne = async (notificationId: string) => {
    await deleteNotification(notificationId);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellIcon className="h-5 w-5" />
          {notifications?.length > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {notifications?.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-4" align="end">
        <div className="space-y-2">
          <h4 className="font-medium leading-none">Notificaciones</h4>
          <p className="text-sm text-muted-foreground">Aquí podrás ver tus notificaciones</p>
        </div>
        <div className={notifications?.length > 0 ? 'mt-2 h-[300px]' : 'mt-2'}>
          {notifications?.length > 0 ? (
            <ScrollArea className="h-full pr-4">
              {notifications.map((notification) => {
                const date = new Date(notification.created_at || '');
                const formattedDate = date.toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                });

                return (
                  <div key={notification.id} className="relative">
                    <_NotificationItem notification={notification} formattedDate={formattedDate} />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0"
                      onClick={() => handleDeleteOne(notification.id)}
                    >
                      <Trash2Icon className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                );
              })}
            </ScrollArea>
          ) : (
            <p className="text-sm text-muted-foreground/60 py-2">No tienes notificaciones pendientes</p>
          )}
        </div>
        <Separator className="my-4" />
        <div className="flex justify-center">
          <Button
            variant="destructive"
            className="w-full"
            size="sm"
            onClick={handleDeleteAll}
            disabled={notifications?.length === 0}
          >
            <Trash2Icon className="mr-2 h-4 w-4" />
            Eliminar todas
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
