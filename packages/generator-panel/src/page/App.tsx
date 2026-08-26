import { useReducer, useState, useRef, useCallback } from 'react'
import { Dropzone } from '@mantine/dropzone'
import { Button, Text, Group, Tabs, Modal } from '@mantine/core'
import html2canvas from 'html2canvas-pro'
import './App.css'
import MainPanelWrapper from '../component/panel/component/MainPanelWrapper'
import ExerciseContentTemplate from '../component/panel/component/desktop/exerciseContentTemplate'
import type { IExerciseContentJsonData } from '../component/panel/type'
import PanelDataUpdateHandler from '../component/panel/utils/panelDataHandler'
import utilityReducer from '../component/panel/reducer/UtilityReducer'
import {useImmerReducer} from 'use-immer'
import { UtilityAction } from '../component/panel/reducer/actionTypes'
import makeMarkingJson, { getScore } from '../component/panel/utils/makeMarkingJson'
import acessmentLogo from '../assets/image/acessment_production-web-adjusted.png'

function App() {
  const [jsonContent, jsonContentDispatch] = useImmerReducer(utilityReducer, {} as IExerciseContentJsonData)
  const [fileName, setFileName] = useState<string>('')
  const [activeMode, setActiveMode] = useState<string>('exercise')
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState<boolean>(false)
  const [thumbnailModalOpened, setThumbnailModalOpened] = useState<boolean>(false)
  const thumbnailRef = useRef<HTMLDivElement>(null)

  const handleDrop = (files: File[]) => {
    const file = files[0]
    if (file) {
      setFileName(file.name)
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target?.result as string)
          if (!Array.isArray(content)) {
            jsonContentDispatch({ type: 'SET_EXERCISE_CONTENT', payload: content })
            console.log('JSON Content:', content)
          }
          else {
            jsonContentDispatch({ type: 'SET_EXERCISE_CONTENT', payload: content[0] })
            console.log('JSON Content:', content[0])
          }
        } catch (error) {
          console.error('Invalid JSON file:', error)
          alert('Please upload a valid JSON file')
        }
      }
      reader.readAsText(file)
    }
  }

  const handleLogContent = () => {
    console.log('JSON Content log:', jsonContent)
  }

  const handleLogMarkingJson = () => {
    const markingResult = makeMarkingJson(jsonContent)
    console.log('Marking JSON Result:', markingResult)
  }

  const handleLogScore = () => {
    const totalScore = getScore(jsonContent)
    console.log('Total Score:', totalScore)
  }

  const handleGenerateThumbnail = async () => {
    setThumbnailModalOpened(true)
    
    // Wait a bit for modal to render and content to be available
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Automatically trigger thumbnail generation
    await onGenerateThumbnailClick()
    
    // Close modal after generation
    setThumbnailModalOpened(false)
  }

  const onGenerateThumbnailClick = async () => {
    if (!thumbnailRef.current) {
      alert('Error: Reference to content is null')
      return
    }

    setIsGeneratingThumbnail(true)
    
    try {
      // Wait for content to be fully rendered
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Try to find the actual component element within the container      
      const canvas = await html2canvas(thumbnailRef.current, {
          allowTaint: true,
          useCORS: true,
          scale: 1, // Use 1:1 scale to match exact display
          backgroundColor: "#ffffff",
          removeContainer: false,
          logging: false, // Disable console logs
          imageTimeout: 0, // No timeout for image loading
      });
      
      const dataURL = canvas.toDataURL("image/png", 1.0) // Maximum quality
      
      const link = document.createElement("a")
      link.href = dataURL
      link.download = `exercise-thumbnail-${Date.now()}.png`
      link.click()
      
      alert('Thumbnail downloaded successfully!')
    } catch (error) {
      console.error('Error generating thumbnail:', error)
      alert('Error generating thumbnail')
    } finally {
      setIsGeneratingThumbnail(false)
    }
  }
  const handleReplaceJsonContent = () => {
    const markingJson = makeMarkingJson(jsonContent)
    jsonContentDispatch({ type: "SET_EXERCISE_CONTENT", payload: markingJson })
  }

  const handleDownloadJson = () => {
    const dataStr = JSON.stringify([jsonContent], null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    
    const link = document.createElement('a')
    link.href = URL.createObjectURL(dataBlob)
    link.download = `exercise-content-${Date.now()}.json`
    link.click()
    
    // Clean up the URL object
    URL.revokeObjectURL(link.href)
  }


  const getModeProps = () => {
    switch (activeMode) {
      case 'exercise':
        return { isExerciseView: true, showUtility: false, showMarkingUtility: false, isViewMarking: false }
      case 'edit':
        return { isExerciseView: false, showUtility: true, showMarkingUtility: false, isViewMarking: false }
      case 'marking':
        return { isExerciseView: false, showUtility: true, showMarkingUtility: true, isViewMarking: false }
      case 'view-marking':
        return { isExerciseView: false, showUtility: false, showMarkingUtility: false, isViewMarking: true }
      default:
        return { isExerciseView: true, showUtility: false, showMarkingUtility: false, isViewMarking: false }
    }
  }

  return (
      <div className="p-8 w-full mx-auto">
          <h1 className="font-bold underline text-3xl mb-8">
              React Generator Panel
          </h1>
          <Tabs
              value={activeMode}
              onChange={(value) => setActiveMode(value || "exercise")}
              className="mb-6"
          >
              <Tabs.List>
                  <Tabs.Tab value="exercise">Exercise Mode</Tabs.Tab>
                  <Tabs.Tab value="edit">Edit Mode</Tabs.Tab>
                  <Tabs.Tab value="marking">Marking Mode</Tabs.Tab>
                  <Tabs.Tab value="view-marking">View Marking Mode</Tabs.Tab>
              </Tabs.List>
          </Tabs>
          <Dropzone
              onDrop={handleDrop}
              accept={["application/json"]}
              multiple={false}
              className="mb-6"
          >
              <Group
                  justify="center"
                  gap="xl"
                  mih={220}
                  style={{ pointerEvents: "none" }}
              >
                  <div>
                      <Text size="xl" inline>
                          Drag JSON files here or click to select files
                      </Text>
                      <Text size="sm" c="dimmed" inline mt={7}>
                          Only .json files are accepted
                      </Text>
                  </div>
              </Group>
          </Dropzone>
          {fileName && (
              <Text className="mb-4" c="green">
                  File uploaded: {fileName}
              </Text>
          )}
          <Button
              onClick={handleLogContent}
              className="bg-blue-500 hover:bg-blue-600 mr-4"
          >
              Log JSON Content to Console
          </Button>
          <Button
              onClick={handleLogMarkingJson}
              className="bg-green-500 hover:bg-green-600 mr-4"
          >
              Log Marking JSON to Console
          </Button>
          <Button
              onClick={handleLogScore}
              className="bg-orange-500 hover:bg-orange-600 mr-4"
          >
              Log Total Score to Console
          </Button>
          <Button
              onClick={handleReplaceJsonContent}
              className="bg-red-500 hover:bg-red-600 mr-4"
          >
              Replace json content with marking json
          </Button>
          <Button
              onClick={handleDownloadJson}
              className="bg-cyan-500 hover:bg-cyan-600 mr-4"
          >
              Download Current JSON
          </Button>
          <Button
              onClick={handleGenerateThumbnail}
              className="bg-purple-500 hover:bg-purple-600 mr-4"
              loading={isGeneratingThumbnail}
              disabled={isGeneratingThumbnail}
          >
              {isGeneratingThumbnail ? 'Generating Thumbnail...' : 'Generate Thumbnail'}
          </Button>
          <Modal
              opened={thumbnailModalOpened}
              onClose={() => setThumbnailModalOpened(false)}
              title="Generating Thumbnail..."
              size="auto"
              centered
              closeOnClickOutside={false}
              closeOnEscape={false}
          >
              <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                  <Text>Please wait while we generate your thumbnail...</Text>
              </div>
              
              <div 
                  ref={thumbnailRef}
                  style={{
                      width: "794px",
                      height: "1123px",
                      backgroundColor: "#ffffff",
                      margin: "0 auto",
                      border: "1px solid #e0e0e0",
                      overflow: "auto",
                      padding: "20px",
                  }}
              >
                  <ExerciseContentTemplate
                      data={jsonContent}
                      utilityDispatch={jsonContentDispatch}
                      isExerciseView={true}
                      showUtility={false}
                      showMarkingUtility={false}
                      isViewMarking={false}
                      handleUpdate={(e, val) => {}}
                  />
              </div>
          </Modal>
          <MainPanelWrapper
              {...getModeProps()}
              logoUrl={acessmentLogo}
              logoSize={18}
              jsonData={jsonContent}
              showUtility={getModeProps().showUtility}
              dispatch={jsonContentDispatch}
          />{" "}
      </div>
  );
}

export default App
