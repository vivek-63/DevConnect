import { useContext, useEffect } from "react";
import { notificationContext } from "../context/notificationContext";


export const useNotification = () => {
    
  const context = useContext(notificationContext);

  const { notification, setnotification, unreadCount } = context;



 return {
   notification, setnotification, unreadCount 
  };
}