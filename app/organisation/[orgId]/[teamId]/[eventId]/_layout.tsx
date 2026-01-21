import { Stack } from 'expo-router';

export default function TeamLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="ViewEvent"
        options={{ title: 'Event' }}
      />
    </Stack>
  );
}
