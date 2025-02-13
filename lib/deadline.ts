export type DeadlineInfo = {
    statusText: string;
    textColor: string;
    daysDifference: number;
    rawDate: Date;
  }
  
  export const getDeadlineInfo = (dateString: string, fromDate?: string): DeadlineInfo => {
    const deadlineDate = new Date(dateString);
    const today = fromDate ? new Date(fromDate) : new Date();
    // Normalize dates to midnight
    today.setHours(0, 0, 0, 0);
    const normalizedDeadline = new Date(deadlineDate);
    normalizedDeadline.setHours(0, 0, 0, 0);
  
    const timeDifference = normalizedDeadline.getTime() - today.getTime();
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  
    let statusText = '';
    let textColor = '';
  
    if (daysDifference > 20) {
      statusText = `H-${daysDifference}`;
      textColor = 'text-green-500';
    } else if (daysDifference >= 0) {
      statusText = `h-${daysDifference}`;
      textColor = 'text-yellow-500';
    } else {
      statusText = `h+${Math.abs(daysDifference)}`;
      textColor = 'text-red-500';
    }
  
    return {
      statusText,
      textColor,
      daysDifference,
      rawDate: deadlineDate
    };
  };