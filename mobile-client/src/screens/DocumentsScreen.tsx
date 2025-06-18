import React, {useState} from 'react';
import {View, StyleSheet, FlatList} from 'react-native';
import {Text, FAB, Card, IconButton, Menu} from 'react-native-paper';
import DocumentPicker from 'react-native-document-picker';
import {launchCamera} from 'react-native-image-picker';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uri: string;
  date: Date;
}

const DocumentsScreen = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      const newDoc: Document = {
        id: Date.now().toString(),
        name: result[0].name || 'Untitled',
        type: result[0].type || 'unknown',
        size: result[0].size || 0,
        uri: result[0].uri,
        date: new Date(),
      };

      setDocuments([newDoc, ...documents]);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error(err);
      }
    }
  };

  const scanDocument = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 1,
      });

      if (result.assets && result.assets[0]) {
        const newDoc: Document = {
          id: Date.now().toString(),
          name: 'Scanned Document',
          type: 'image/jpeg',
          size: result.assets[0].fileSize || 0,
          uri: result.assets[0].uri || '',
          date: new Date(),
        };

        setDocuments([newDoc, ...documents]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteDocument = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
    setMenuVisible(false);
  };

  const renderDocument = ({item}: {item: Document}) => (
    <Card style={styles.documentCard}>
      <Card.Content>
        <View style={styles.documentHeader}>
          <Text variant="titleMedium">{item.name}</Text>
          <IconButton
            icon="dots-vertical"
            onPress={() => {
              setSelectedDoc(item);
              setMenuVisible(true);
            }}
          />
        </View>
        <Text variant="bodySmall">
          {new Date(item.date).toLocaleDateString()}
        </Text>
        <Text variant="bodySmall">
          {(item.size / 1024).toFixed(2)} KB
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Documents
      </Text>

      <FlatList
        data={documents}
        renderItem={renderDocument}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />

      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={{x: 0, y: 0}}>
        <Menu.Item
          onPress={() => {
            if (selectedDoc) {
              deleteDocument(selectedDoc.id);
            }
          }}
          title="Delete"
          leadingIcon="delete"
        />
      </Menu>

      <FAB.Group
        open={false}
        visible
        actions={[
          {
            icon: 'file-upload',
            label: 'Pick Document',
            onPress: pickDocument,
          },
          {
            icon: 'camera',
            label: 'Scan Document',
            onPress: scanDocument,
          },
        ]}
        icon="plus"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  title: {
    textAlign: 'center',
    marginVertical: 24,
  },
  list: {
    padding: 16,
  },
  documentCard: {
    marginBottom: 16,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default DocumentsScreen; 