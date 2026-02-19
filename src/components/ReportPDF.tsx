
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { DCASScores, DCASType, getScoreLevel } from '@/lib/dcas/scoring';
import { interpretations, getCombinedProfileDescription } from '@/lib/dcas/interpretations';
import { getCareerRecommendations, careersByType } from '@/lib/dcas/careers';

// Register fonts (optional, using default Helvetica for now for simplicity, 
// but we could register custom fonts if needed)
// Font.register({ family: 'Inter', src: '...' });

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 5,
  },
  date: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 4,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#0f172a',
    backgroundColor: '#f1f5f9',
    padding: 5,
    borderRadius: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  col: {
    flexDirection: 'column',
    flex: 1,
  },
  card: {
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    marginBottom: 5,
  },
  scoreCard: {
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    width: '30%',
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  badge: {
     padding: '4 8',
     borderRadius: 4,
     fontSize: 10,
     color: 'white',
     alignSelf: 'center',
  },
  text: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#334155',
    marginBottom: 5,
  },
  bulletPoint: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#334155',
    marginLeft: 10,
    marginBottom: 2,
  },
  chartContainer: {
     height: 150,
     marginVertical: 10,
     position: 'relative',
     borderLeftWidth: 1,
     borderBottomWidth: 1,
     borderColor: '#cbd5e1',
     flexDirection: 'row',
     alignItems: 'flex-end',
     justifyContent: 'space-around',
     paddingBottom: 0,
     paddingLeft: 0,
  },
  bar: {
    width: 30,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
  traitList: {
      marginTop: 5,
  },
  careerItem: {
      marginBottom: 8,
      padding: 8,
      backgroundColor: '#f8fafc',
      borderRadius: 4,
  }
});

interface ReportPDFProps {
  scores: DCASScores;
  rankedTypes: DCASType[];
  dcasColors: any;
  dcasNames: any;
  maxScore: number;
  studentName?: string;
  assessmentDate?: string;
  logoUrl?: string | null;
}

export const ReportPDF = ({ scores, rankedTypes, dcasColors, dcasNames, maxScore, studentName, assessmentDate, logoUrl }: ReportPDFProps) => {
  const primaryType = rankedTypes[0];
  const secondaryType = rankedTypes[1];
  const tertiaryType = rankedTypes[2];
  
  const primaryInterp = interpretations[primaryType];
  const profileDesc = getCombinedProfileDescription(primaryType, secondaryType);
  const careers = getCareerRecommendations(primaryType, secondaryType);
  const currentDate = assessmentDate 
    ? new Date(assessmentDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {logoUrl && (
            <Image
              src={logoUrl}
              style={{ width: 60, height: 60, marginBottom: 10, borderRadius: 10 }}
            />
          )}
          <Text style={styles.title}>DCAS Behavioural Assessment Report</Text>
          <Text style={styles.subtitle}>Comprehensive Behavioural Analysis & Career Guidance</Text>
          {studentName && <Text style={{ fontSize: 14, marginTop: 5, color: '#475569' }}>Name: {studentName}</Text>}
          <Text style={styles.date}>Generated on {currentDate}</Text>
        </View>

        {/* 1. Profile Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Profile Overview</Text>
          <View style={styles.row}>
            {[
                { type: primaryType, label: "Primary Type" },
                { type: secondaryType, label: "Secondary Type" },
                { type: tertiaryType, label: "Tertiary Type" },
            ].map(({ type, label }) => (
                <View key={type} style={styles.scoreCard}>
                    <View style={{ 
                        width: 40, 
                        height: 40, 
                        backgroundColor: dcasColors[type].primary, 
                        borderRadius: 8, 
                        marginBottom: 5,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                         <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>{type}</Text>
                    </View>
                    <Text style={{ fontSize: 10, color: '#64748b' }}>{label}</Text>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#0f172a' }}>{dcasNames[type]}</Text>
                    <Text style={{ ...styles.scoreValue, color: dcasColors[type].primary }}>{scores[type]} / {maxScore}</Text>
                    <Text style={{ fontSize: 10, color: '#64748b' }}>{getScoreLevel(scores[type], maxScore)}</Text>
                </View>
            ))}
          </View>
        </View>

        {/* 2. Score Visualization (Simple Bar Chart) */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Score Visualization</Text>
            <View style={styles.chartContainer}>
                {['D', 'C', 'A', 'S'].map((type) => {
                    const score = scores[type as DCASType];
                    const heightPercent = (score / maxScore) * 100;
                    return (
                        <View key={type} style={{ alignItems: 'center', height: '100%', justifyContent: 'flex-end', width: '25%' }}>
                             {/* Bar Label (Score) */}
                             <Text style={{ fontSize: 8, marginBottom: 2 }}>{score}</Text>
                             {/* The Bar */}
                             <View style={{
                                 ...styles.bar,
                                 height: `${heightPercent}%`,
                                 backgroundColor: dcasColors[type].primary,
                             }} />
                             {/* X Axis Label */}
                             <Text style={{ fontSize: 10, marginTop: 4, fontWeight: 'bold' }}>{type}</Text>
                        </View>
                    );
                })}
            </View>
        </View>

        {/* 3. Behavioural Description */}
        <View style={styles.section}>
             <Text style={styles.sectionTitle}>3. Behavioural Description</Text>
             <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                 <View style={{ 
                        width: 40, 
                        height: 40, 
                        backgroundColor: dcasColors[primaryType].primary, 
                        borderRadius: 8, 
                        marginRight: 10,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                      <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>{primaryType}</Text>
                 </View>
                 <View>
                     <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{dcasNames[primaryType]}</Text>
                     <Text style={{ fontSize: 10, color: '#64748b' }}>{primaryInterp.traits.join(" · ")}</Text>
                 </View>
             </View>
             <Text style={styles.text}>{profileDesc}</Text>
             
             <View style={styles.row}>
                 <View style={{ flex: 1, marginRight: 10 }}>
                     <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 5 }}>Core Strengths</Text>
                     {primaryInterp.strengths.map((s, i) => (
                         <Text key={i} style={styles.bulletPoint}>• {s}</Text>
                     ))}
                 </View>
                 <View style={{ flex: 1 }}>
                     <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 5 }}>Key Traits</Text>
                     {primaryInterp.traits.map((t, i) => (
                         <Text key={i} style={styles.bulletPoint}>• {t}</Text>
                     ))}
                 </View>
             </View>
        </View>
        
        <Text style={styles.footer} fixed>
            © {new Date().getFullYear()} DCAS Behavioural Assessment
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>
         {/* 4. Communication & Stress */}
         <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Communication & Stress Patterns</Text>
            <View style={styles.card}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 5 }}>Communication Style</Text>
                <Text style={styles.text}>{primaryInterp.communicationStyle}</Text>
            </View>
            <View style={styles.card}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 5 }}>Stress Response</Text>
                <Text style={styles.text}>{primaryInterp.stressResponse}</Text>
            </View>
         </View>

         {/* 5. Development Areas */}
         <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Development Areas</Text>
            <Text style={{ ...styles.text, marginBottom: 10 }}>
                While your DCAS profile highlights many strengths, focusing on these development areas will help you become more well-rounded.
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {primaryInterp.developmentAreas.map((area, index) => (
                    <View key={index} style={{ 
                        width: '48%', 
                        marginRight: index % 2 === 0 ? '4%' : 0, 
                        marginBottom: 10,
                        backgroundColor: '#fffbeb',
                        padding: 8,
                        borderRadius: 4,
                        borderWidth: 1,
                        borderColor: '#fcd34d'
                    }}>
                        <Text style={styles.text}>{area}</Text>
                    </View>
                ))}
            </View>
         </View>

         {/* 6. Career Recommendations */}
         <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Career Recommendations</Text>
            <Text style={{ ...styles.text, marginBottom: 10 }}>
                Based on your DCAS profile, the following careers align with your natural behavioural tendencies.
            </Text>
            {rankedTypes.slice(0, 3).map((type, typeIndex) => (
                <View key={type} style={{ marginBottom: 15 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                        <View style={{ 
                            width: 20, height: 20, 
                            backgroundColor: dcasColors[type].primary, 
                            borderRadius: 4, 
                            alignItems: 'center', justifyContent: 'center',
                            marginRight: 5
                        }}>
                             <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{type}</Text>
                        </View>
                        <Text style={{ fontSize: 12, fontWeight: 'bold' }}>
                            {dcasNames[type]} Careers ({typeIndex === 0 ? "Primary" : typeIndex === 1 ? "Secondary" : "Tertiary"})
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'column' }}>
                         {(careersByType[type] || []).slice(0, 3).map((career, index) => (
                             <View key={index} style={styles.careerItem}>
                                 <Text style={{ fontSize: 11, fontWeight: 'bold' }}>{career.title}</Text>
                                 <Text style={{ fontSize: 10, color: '#64748b', marginBottom: 2 }}>{career.description}</Text>
                                 <Text style={{ fontSize: 9, color: '#94a3b8' }}>Skills: {career.skills.join(", ")}</Text>
                             </View>
                         ))}
                    </View>
                </View>
            ))}
         </View>
         
         <Text style={styles.footer} fixed>
            © {new Date().getFullYear()} DCAS Behavioural Assessment
        </Text>
      </Page>
      
      <Page size="A4" style={styles.page}>
          {/* 7. Action Plan */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Action Plan for Growth</Text>
            <View style={{ backgroundColor: '#f0f9ff', padding: 15, borderRadius: 8 }}>
                {[
                    {
                      num: 1,
                      title: "Leverage Your Strengths",
                      desc: `Your ${dcasNames[primaryType].toLowerCase()} trait is your superpower. Seek opportunities where ${primaryInterp.strengths[0]?.toLowerCase()} is valued.`,
                    },
                    {
                      num: 2,
                      title: "Build Complementary Skills",
                      desc: `Focus on developing skills from your secondary type (${dcasNames[secondaryType]}).`,
                    },
                    {
                      num: 3,
                      title: "Address Development Areas",
                      desc: `Start with: "${primaryInterp.developmentAreas[0]}". Set specific goals.`,
                    },
                    {
                      num: 4,
                      title: "Explore Career Paths",
                      desc: "Research the recommended careers. Connect with professionals.",
                    },
                    {
                      num: 5,
                      title: "Seek Ideal Environments",
                      desc: `Look for work environments that suit: ${primaryInterp.workEnvironment}.`,
                    },
                  ].map((step) => (
                    <View key={step.num} style={{ marginBottom: 12, flexDirection: 'row' }}>
                        <View style={{ 
                            width: 24, height: 24, 
                            borderRadius: 12, 
                            backgroundColor: '#3b82f6', 
                            alignItems: 'center', justifyContent: 'center',
                            marginRight: 10
                        }}>
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>{step.num}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 2 }}>{step.title}</Text>
                            <Text style={styles.text}>{step.desc}</Text>
                        </View>
                    </View>
                  ))}
            </View>
          </View>
          
           <Text style={styles.footer} fixed>
            © {new Date().getFullYear()} DCAS Behavioural Assessment
        </Text>
      </Page>
    </Document>
  );
};
