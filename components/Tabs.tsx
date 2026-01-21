import { View, Text, Pressable } from "react-native"

type TabItem = {
    id: number;
    label: string;
}

type TabsProps = {
    data: TabItem[];
    selectedIndex: number;
    onChange: (index: number) => void;
};

export function Tabs({data, selectedIndex, onChange }: TabsProps) {
    return (
        <View style={{flexDirection: "row", gap: 5, padding: 10, width: '100%', backgroundColor: 'white'}}>
            {data.map((item, index) => {
                const isSelected = selectedIndex == index
                return (
                    <View key={item.id}>
                        <Pressable 
                            onPress={() => onChange(index)}
                            style={{
                                backgroundColor : isSelected ? "#1e90ff" : "#FFF",
                                padding: 5,
                                borderRadius: 5,
                            }}
                        >
                            <Text style={{color: isSelected ? "#FFF" : "#000"}}>{item.label}</Text>
                        </Pressable>
                    </View>
                );
            })}
        </View>
    )
}