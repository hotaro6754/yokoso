"use client";

import { motion } from 'framer-motion';
import { Camera, Mail, Phone, MapPin } from 'lucide-react';

export default function ProfileHeader({ profileData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden"
    >
      <div className="relative">
        {/* Cover Photo */}
        <div className="h-32 bg-gradient-to-r from-primary via-primary/80 to-accent"></div>

        {/* Profile Content */}
        <div className="px-4 pb-4 sm:px-6 sm:pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16">
            {/* Profile Photo */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="relative"
            >
              <div className="w-32 h-32 rounded-full border-4 border-card bg-muted overflow-hidden shadow-lg">
                <img
                  src="/images/users/user-01.png"
                  alt={`${profileData.firstName} ${profileData.lastName}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute bottom-2 right-2 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition shadow-lg"
              >
                <Camera size={16} />
              </motion.button>
            </motion.div>

            {/* Profile Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left"
            >
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {profileData.firstName} {profileData.lastName}
              </h1>
              <p className="text-muted-foreground mt-1">{profileData.email}</p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start mt-3 gap-4">
                {profileData.phone && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg"
                  >
                    <Phone size={16} className="mr-2 text-primary" />
                    {profileData.phone}
                  </motion.div>
                )}
                {profileData.currentAddress && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg"
                  >
                    <MapPin size={16} className="mr-2 text-primary" />
                    {profileData.city}, {profileData.state}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
