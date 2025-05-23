import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define the conversation type
interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
}

// Mock data for conversations
const mockConversations: Conversation[] = [];

export default function MessagesScreen() {
  const renderEmptyState = () => (
    <ThemedView style={styles.emptyStateContainer}>
      <Ionicons name="chatbubble-ellipses" size={60} color={Colors.light.tabIconDefault} />
      <ThemedText type="subtitle" style={styles.emptyStateTitle}>
        אין הודעות
      </ThemedText>
      <ThemedText style={styles.emptyStateText}>
        כשתצטרף לקבוצות רכיבה או תיצור קשר עם רוכבים, ההודעות שלך יופיעו כאן
      </ThemedText>
    </ThemedView>
  );

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity style={styles.conversationItem}>
      <View style={styles.avatarContainer}>
        <Ionicons name="person-circle" size={50} color={Colors.light.tabIconDefault} />
      </View>
      <View style={styles.conversationContent}>
        <ThemedText type="defaultSemiBold" style={styles.conversationName}>
          {item.name}
        </ThemedText>
        <ThemedText style={styles.conversationMessage} numberOfLines={1}>
          {item.lastMessage}
        </ThemedText>
      </View>
      <ThemedText style={styles.conversationTime}>
        {item.time}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <View style={styles.container}>
        <ThemedText type="title" style={styles.title}>הודעות</ThemedText>
        
        <FlatList
          data={mockConversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConversationItem}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 20,
    textAlign: 'right',
  },
  listContainer: {
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  avatarContainer: {
    marginLeft: 12,
  },
  conversationContent: {
    flex: 1,
  },
  conversationName: {
    textAlign: 'right',
  },
  conversationMessage: {
    textAlign: 'right',
    opacity: 0.7,
  },
  conversationTime: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
  },
}); 