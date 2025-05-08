"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { AlertCircle, CheckCircle2, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Component that only renders its children after the component has mounted on the client
// This helps avoid hydration mismatches for components that depend on client-side state
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return <>{children}</>
}
const formSchema = z.object({
  age: z.coerce.number().min(16).max(100),
  gender: z.string().min(1, { message: "Por favor selecciona un género" }),
  yearOfStudy: z.coerce.number().min(1).max(10),
  course: z.string().min(1, { message: "Por favor selecciona un curso" }),
  cgpa: z.coerce.number().min(0).max(10),
  married: z.string().min(1, { message: "Por favor selecciona una opción" }),
  specializedTreatment: z.string().min(1, { message: "Por favor selecciona una opción" }),
})

const courses = [
  "Ingeniería Informática",
  "Ingeniería Civil",
  "Medicina",
  "Derecho",
  "Psicología",
  "Administración de Empresas",
  "Arquitectura",
  "Biología",
  "Química",
  "Física",
  "Matemáticas",
  "Economía",
  "Comunicación",
  "Diseño Gráfico",
  "Enfermería",
]

export default function StressPredictorPage() {
  const [prediction, setPrediction] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [serverStatus, setServerStatus] = useState<"checking" | "online" | "offline" | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: 0,
      gender: "",
      yearOfStudy: 0,
      course: "",
      cgpa: 0,
      married: "",
      specializedTreatment: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    setError(null)
    setPrediction(null)

    const requestBody = {
      age: values.age,
      gender: values.gender === "Masculino" ? 0 : 1,
      year_of_study: values.yearOfStudy,
      course: parseInt(values.course),
      cgpa: values.cgpa,
      marital_status: values.married === "Sí" ? 1 : 0,
      specialist_treatment: values.specializedTreatment === "Sí" ? 1 : 0, 
    }

    console.log("Valores enviados:", requestBody)

    try {
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error("Error al conectar con el servidor")
      }

      const data = await response.json()
      setPrediction(data)
      console.log("Respuesta del servidor:", data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  async function checkServerStatus() {
    setServerStatus("checking")
    try {
      const response = await fetch("http://127.0.0.1:8000/health")
      if (response.ok) {
        setServerStatus("online")
      } else {
        setServerStatus("offline")
      }
    } catch (err) {
      setServerStatus("offline")
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Predictor de Estrés para Estudiantes</h1>

      <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Formulario de Predicción</CardTitle>
            <CardDescription>Completa todos los campos para predecir si sufres de estrés</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Edad</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Ej: 21" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Género</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona tu género" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Masculino">Masculino</SelectItem>
                            <SelectItem value="Femenino">Femenino</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="yearOfStudy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Año de estudio</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number.parseInt(value))}
                          defaultValue={field.value?.toString() || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona tu año" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6].map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}º año
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="course"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Curso</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona tu curso" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {courses.map((course, index) => (
                              <SelectItem key={course} value={index.toString()}>
                                {course}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cgpa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CGPA</FormLabel>
                        <FormControl>
                          <Input type="number" step={0} placeholder="Ej: 7.5" {...field} />
                        </FormControl>
                        <FormDescription>Promedio académico (0-10)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="married"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>¿Casado/a?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Sí">Sí</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormField
                      control={form.control}
                      name="specializedTreatment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>¿Ha buscado tratamiento especializado?</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sí">Sí</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>

                <div className="flex justify-between items-center pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={checkServerStatus}
                    disabled={serverStatus === "checking"}
                  >
                    Verificar estado del servidor
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Procesando..." : "Predecir"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>

          {/* Wrap server status alert with ClientOnly to prevent hydration mismatch */}
          <ClientOnly>
            {serverStatus && (
              <CardFooter>
                <Alert variant={serverStatus === "online" ? "default" : "destructive"}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Estado del servidor</AlertTitle>
                  <AlertDescription>
                    {serverStatus === "checking" && "Verificando estado del servidor..."}
                    {serverStatus === "online" && "El servidor está en línea y funcionando correctamente."}
                    {serverStatus === "offline" && "El servidor está fuera de línea o no responde."}
                  </AlertDescription>
                </Alert>
              </CardFooter>
            )}
          </ClientOnly>
        </Card>

        <div className="space-y-8">
          {/* Wrap prediction results with ClientOnly to prevent hydration mismatch */}
          <ClientOnly>
            {prediction && (
              <Card className={prediction.stress === "Yes" ? "border-red-400" : "border-green-400"}>
                <CardHeader className={prediction.stress === "Yes" ? "bg-red-50" : "bg-green-50"}>
                  <CardTitle className="flex items-center gap-2">
                    {prediction.stress === "Yes" ? (
                      <>
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <span>Resultado: Estrés Detectado</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span>Resultado: Sin Estrés</span>
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p>
                    {prediction.stress === "Yes"
                      ? "Según los datos proporcionados, es probable que estés experimentando estrés. Te recomendamos revisar la sección de Salud para obtener más información."
                      : "Según los datos proporcionados, no se detectan signos de estrés. ¡Sigue así!"}
                  </p>
                </CardContent>
              </Card>
            )}
          </ClientOnly>

          {/* Wrap error alert with ClientOnly to prevent hydration mismatch */}
          <ClientOnly>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </ClientOnly>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Salud
              </CardTitle>
              <CardDescription>Información sobre factores que contribuyen al estrés</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="factors">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="factors">Factores</TabsTrigger>
                  <TabsTrigger value="tips">Consejos</TabsTrigger>
                </TabsList>
                <TabsContent value="factors" className="space-y-4 pt-4">
                  <h3 className="font-medium">Factores que contribuyen al estrés en estudiantes:</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Carga académica excesiva</li>
                    <li>Presión por obtener buenas calificaciones</li>
                    <li>Problemas financieros</li>
                    <li>Dificultades en relaciones personales</li>
                    <li>Falta de sueño y descanso adecuado</li>
                    <li>Incertidumbre sobre el futuro profesional</li>
                  </ul>
                </TabsContent>
                <TabsContent value="tips" className="space-y-4 pt-4">
                  <h3 className="font-medium">Consejos para manejar el estrés:</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Practicar técnicas de respiración y meditación</li>
                    <li>Mantener una rutina de ejercicio regular</li>
                    <li>Establecer horarios de estudio realistas</li>
                    <li>Buscar apoyo en amigos, familia o profesionales</li>
                    <li>Dormir al menos 7-8 horas diarias</li>
                    <li>Alimentarse de manera saludable</li>
                  </ul>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
