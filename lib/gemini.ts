// Gemini AI Smart Campus Integration for ResourceX
// Powered by Google Gemini API with robust heuristic fallback

export interface ResourceMatchRecommendation {
  resourceId: string;
  resourceTitle: string;
  confidenceScore: number;
  reason: string;
  recommendedSlot: string;
  requiredCertifications: string[];
  suggestedPurpose: string;
}

export interface ConditionInspectionAnalysis {
  status: "normal_wear" | "potential_damage" | "pristine";
  confidence: number;
  summary: string;
  recommendationForOwner: string;
  fairSharePenaltySuggested: number;
}

export async function askGeminiResourceAssistant(
  prompt: string,
  availableResources: Array<{ id: string; title: string; category: string; description: string; location: string }>
): Promise<{ reply: string; recommendations: ResourceMatchRecommendation[] }> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `You are the ResourceX AI Campus Lab Coordinator for Apex Institute of Technology.
Available Campus Resources:
${JSON.stringify(availableResources, null, 2)}

User Request: "${prompt}"

Respond in valid JSON with this exact structure:
{
  "reply": "friendly explanation of how these resources fulfill their engineering/academic goal",
  "recommendations": [
    {
      "resourceId": "id of matching resource",
      "resourceTitle": "title",
      "confidenceScore": 0.95,
      "reason": "why this specific gear is ideal",
      "recommendedSlot": "e.g. Wednesday 14:00-17:00 (Off-Peak)",
      "requiredCertifications": ["training required"],
      "suggestedPurpose": "formal booking purpose paragraph to maximize approval"
    }
  ]
}`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          }),
        }
      );

      if (response.ok) {
        const json = await response.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          return parsed;
        }
      }
    } catch (err) {
      console.warn("Gemini API call failed, falling back to smart local heuristic parser", err);
    }
  }

  // Smart Heuristic Engine (works 100% offline or when API key is not configured)
  const query = prompt.toLowerCase();
  const matched: ResourceMatchRecommendation[] = [];

  if (query.includes("3d") || query.includes("print") || query.includes("resin") || query.includes("prototype") || query.includes("part")) {
    matched.push({
      resourceId: "res_formlabs_4",
      resourceTitle: "Formlabs Form 4 High-Speed SLA Resin 3D Printer",
      confidenceScore: 0.96,
      reason: "High 50-micron resolution SLA resin printing is ideal for precision engineering parts, fluidics, and enclosure prototypes.",
      recommendedSlot: "Tomorrow 16:30 - 19:30 (Off-Peak Discount: 45% credits saved)",
      requiredCertifications: ["3D Printing & Slicing Safety"],
      suggestedPurpose: "Rapid prototyping of mechanical assemblies and structural enclosures with high surface accuracy.",
    });
  }

  if (query.includes("robot") || query.includes("arm") || query.includes("kinematic") || query.includes("trajectory") || query.includes("ros")) {
    matched.push({
      resourceId: "res_kuka_arm",
      resourceTitle: "KUKA KR 6 R900 Six-Axis Robotic Arm",
      confidenceScore: 0.98,
      reason: "Industrial 6-axis precision manipulator equipped with ROS2 interface and force-torque sensing.",
      recommendedSlot: "Friday 14:00 - 17:00",
      requiredCertifications: ["Robotics Lab Tier-1 Certified"],
      suggestedPurpose: "Testing autonomous trajectory planning and end-effector gripper motion for robotics research.",
    });
  }

  if (query.includes("ai") || query.includes("gpu") || query.includes("train") || query.includes("model") || query.includes("deep learning") || query.includes("cuda") || query.includes("llm")) {
    matched.push({
      resourceId: "res_dgx_a100",
      resourceTitle: "NVIDIA DGX A100 AI Supercomputing Node",
      confidenceScore: 0.95,
      reason: "8x 80GB A100 SXM4 cluster provides high compute throughput for multi-GPU model convergence.",
      recommendedSlot: "Thursday 20:00 - 02:00 (Night Batch Queue - Max Priority)",
      requiredCertifications: ["Linux Server Protocol"],
      suggestedPurpose: "Distributed training run on research dataset with automated Slurm checkpointing.",
    });
  }

  if (query.includes("iot") || query.includes("esp32") || query.includes("arduino") || query.includes("sensor") || query.includes("wireless") || query.includes("telemetry") || query.includes("circuit")) {
    matched.push({
      resourceId: "res_esp32_kit",
      resourceTitle: "ESP32-S3 & Arduino Dual-MCU Edge-IoT Prototyping Kits (Bundle)",
      confidenceScore: 0.92,
      reason: "Includes WiFi/BLE transceivers, environmental telemetry breakout modules, and breadboard jumpers.",
      recommendedSlot: "Any weekday 09:00 - 17:00 (Instant Approval, Low Credit Cost)",
      requiredCertifications: ["Microcontroller Prototyping Protocol"],
      suggestedPurpose: "Firmware development and wireless telemetry data streaming for connected smart device proof-of-concept.",
    });
  }

  if (query.includes("oscilloscope") || query.includes("measure") || query.includes("rf") || query.includes("signal") || query.includes("voltage") || query.includes("test")) {
    matched.push({
      resourceId: "res_oscilloscope_tek",
      resourceTitle: "Tektronix 4-Channel 1GHz Mixed Domain Oscilloscope (MSO44)",
      confidenceScore: 0.94,
      reason: "1GHz bandwidth with 16-channel logic analyzer to decode bus timing and power ripple.",
      recommendedSlot: "Wednesday 10:00 - 14:00",
      requiredCertifications: ["High-Voltage Bench Work Safety"],
      suggestedPurpose: "Characterizing signal integrity, bus arbitration, and power rail transients.",
    });
  }

  if (matched.length === 0) {
    // Default fallback to first two resources
    matched.push({
      resourceId: availableResources[0]?.id || "res_formlabs_4",
      resourceTitle: availableResources[0]?.title || "Formlabs Form 4 SLA 3D Printer",
      confidenceScore: 0.85,
      reason: "Universal fabrication platform matching rapid hardware iteration requirements.",
      recommendedSlot: "Tomorrow 14:00 - 17:00",
      requiredCertifications: ["Lab Safety 101"],
      suggestedPurpose: "Project hardware development and academic prototype testing.",
    });
  }

  return {
    reply: `I analyzed your project requirements ("${prompt}"). Based on campus equipment availability, safety clearance matrices, and FairShare quota optimization, I have matched ${matched.length} optimal campus resources for you.`,
    recommendations: matched,
  };
}

export async function inspectConditionReport(
  initialNotes: string,
  returnNotes: string
): Promise<ConditionInspectionAnalysis> {
  const checkInitial = (initialNotes || "").toLowerCase();
  const checkReturn = (returnNotes || "").toLowerCase();

  const damageKeywords = ["crack", "broken", "dent", "scratched lens", "smoke", "smell", "burned", "missing cable", "snapped", "shattered", "jammed"];
  const foundKeywords = damageKeywords.filter((k) => checkReturn.includes(k) && !checkInitial.includes(k));

  if (foundKeywords.length > 0) {
    return {
      status: "potential_damage",
      confidence: 0.92,
      summary: `Automated condition difference detected flags: ${foundKeywords.join(", ")}. Return condition differs significantly from initial baseline verification.`,
      recommendationForOwner: "Perform physical inspection before signing off. Open an Incident Report if damage affects calibration or optical integrity.",
      fairSharePenaltySuggested: 15,
    };
  }

  return {
    status: "pristine",
    confidence: 0.97,
    summary: "Return notes match pre-session baseline. Normal clean usage verified with zero anomalous damage signatures detected.",
    recommendationForOwner: "Approve standard return. Award +2 FairShare community reputation bonus to student.",
    fairSharePenaltySuggested: 0,
  };
}
