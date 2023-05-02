import cron from 'node-cron';
import Rooms from './rooms';

export default function startCron() {
    cron.schedule('*/5 * * * *', () => {
        Rooms.getInstance()
            .getRoomsData()
            .forEach((room, key) => {
                const isEmptyMember = room.getMember().length === 0;
                const hasNotBeenUpdatedSinceFiveMinutesAgo =
                    new Date().getTime() - room.getUpdatedAt().getTime() >= 5 * 60 * 1000;
                if (hasNotBeenUpdatedSinceFiveMinutesAgo && isEmptyMember)
                    Rooms.getInstance().delete(key);
            });
    });
}
