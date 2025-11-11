import React from 'react'
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 32,
  },
  title: {
    fontSize: 28,
    marginBottom: 24,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  heading: {
    fontSize: 20,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  bodyLine: {
    fontSize: 12,
    lineHeight: 1.5,
  },
})

interface ProjectDocumentProps {
  projectName: string
  documents: Array<{ id: string; title: string; content: string | null }>
}

export default function ProjectDocument({ projectName, documents }: ProjectDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{projectName} Documentation</Text>
        {documents.map((doc) => (
          <View key={doc.id} style={styles.section}>
            <Text style={styles.heading}>{doc.title}</Text>
            {(doc.content || '').split('\n').map((line, index) => (
              <Text key={`${doc.id}-line-${index}`} style={styles.bodyLine}>
                {line || ' '}
              </Text>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  )
}
