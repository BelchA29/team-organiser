import { Stack } from "expo-router";

export default function OrganisationLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="ViewOrg"
                options={{ title: 'Organisation'}}
            />
            <Stack.Screen
            name="CreateTeam"
            options={{ title: 'Create Team'}}
            />
            <Stack.Screen
                name="[teamId]"
                options={{headerShown: false}}
            />
        </Stack>
        
    )
}