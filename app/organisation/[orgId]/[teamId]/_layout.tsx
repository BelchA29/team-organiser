import { Stack } from 'expo-router';

export default function TeamLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="ViewTeam"
        options={{ title: 'Team' }}
      />

      <Stack.Screen
        name="CreateEvent"
        options={{ title: 'Create Event' }}
      />

      <Stack.Screen
        name="[eventId]"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
