import React, { useEffect, useRef, useContext, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button } from "react-native";
import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";

export default function App() {
  const LOCATION_TASK_NAME = "background-location-task";
  const GEOFENCING_TASK_NAME = "background-geofencing-task";

  TaskManager.defineTask(
    LOCATION_TASK_NAME,
    ({ data: { locations }, error }) => {
      if (error) {
        throw new Error(error.message);
      }
      if (locations) {
        const [location] = locations;
        console.log(location);
      }
    }
  );

  TaskManager.defineTask(
    GEOFENCING_TASK_NAME,
    ({ data: { eventType, region }, error }) => {
      if (error) {
        throw new Error(error.message);
      }
      if (eventType === Location.GeofencingEventType.Enter) {
        console.log("entered region", region);
      }
      if (eventType === Location.GeofencingEventType.Exit) {
        console.log("exited region", region);
      }
    }
  );

  const startLocationTracking = async () => {
    const { granted: fgGranted } =
      await Location.requestForegroundPermissionsAsync();
    if (!fgGranted) {
      return Alert.alert(
        "location.foregroundServiceAlertTitle",
        "location.foregroundServiceAlertDescription"
      );
    }
    const { granted: bgGranted } =
      await Location.requestBackgroundPermissionsAsync();
    if (!bgGranted) {
      return Alert.alert(
        "location.backgroundServiceAlertTitle",
        "location.backgroundServiceAlertDescription"
      );
    }

    const hasStartedLocationTask = await TaskManager.isTaskDefined(
      LOCATION_TASK_NAME
    );
    if (hasStartedLocationTask) {
      const hasStartedLocation = await Location.hasStartedLocationUpdatesAsync(
        LOCATION_TASK_NAME
      );
      if (!hasStartedLocation) {
        console.log("starting location updates");
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.Highest,
          distanceInterval: 1000,
          pausesUpdatesAutomatically: false,
          showsBackgroundLocationIndicator: true,
          activityType: Location.ActivityType.AutomotiveNavigation,
          foregroundService: {
            notificationTitle: "location.notificationTitle",
            notificationBody: "location.notificationDescription",
            notificationColor: "#FF0000",
          },
        });
      }
    }

    const hasStartedGeoTask = await TaskManager.isTaskDefined(
      GEOFENCING_TASK_NAME
    );
    if (hasStartedGeoTask) {
      const hasStartedGeo = await Location.hasStartedGeofencingAsync(
        GEOFENCING_TASK_NAME
      );
      if (!hasStartedGeo) {
        const regions = [
          {
            identifier: "1",
            latitude: 37.335256,
            longitude: -122.033179,
            radius: 300,
          },
          {
            identifier: "2",
            latitude: 37.333459,
            longitude: -122.04741,
            radius: 300,
          },
          {
            identifier: "3",
            latitude: 37.333159,
            longitude: -122.064813,
            radius: 300,
          },
        ];

        console.log("starting geofencing");
        await Location.startGeofencingAsync(GEOFENCING_TASK_NAME, regions);
      }
    }
  };

  const stopLocationTracking = async () => {
    const { granted: fgGranted } =
      await Location.requestForegroundPermissionsAsync();
    if (fgGranted) {
      const { granted: bgGranted } =
        await Location.requestBackgroundPermissionsAsync();
      if (bgGranted) {
        const hasStartedLocationTask = await TaskManager.isTaskDefined(
          LOCATION_TASK_NAME
        );
        if (hasStartedLocationTask) {
          const hasStartedLocation =
            await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
          if (hasStartedLocation) {
            await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
          }
        }
        const hasStartedGeoTask = await TaskManager.isTaskDefined(
          GEOFENCING_TASK_NAME
        );
        if (hasStartedGeoTask) {
          const hasStartedGeo = await Location.hasStartedGeofencingAsync(
            GEOFENCING_TASK_NAME
          );
          if (hasStartedGeo) {
            await Location.stopGeofencingAsync(GEOFENCING_TASK_NAME);
          }
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text>
        This app is used to test geofencing and location tracking on expo
      </Text>
      <Button
        style={styles.button}
        title="Start tracking"
        onPress={startLocationTracking}
      />
      <Button
        style={styles.button}
        title="Stop tracking"
        onPress={stopLocationTracking}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    margin: 10,
  },
});
