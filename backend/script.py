import requests
import json
import pandas as pd
from time import sleep

# API endpoint and headers
url = "https://api.platform.dev.opentargets.xyz/api/v4/graphql"
headers = {
    'Content-Type': 'application/json',
}

# Example target-disease pairs (replace/add more as needed)
pairs = [
    {"ensgId": "ENSG00000169174", "efoId": "MONDO_0011369"},
    {"ensgId": "ENSG00000157764", "efoId": "EFO_0000311"},  # EGFR - cancer
    {"ensgId": "ENSG00000139618", "efoId": "EFO_0000222"},  # BRCA2 - breast cancer
]

# Store all results here
results = []

for pair in pairs:
    print(f"Querying: {pair['ensgId']} and {pair['efoId']}")
    payload = {
        "operationName": "EvidenceProfileQuery",
        "variables": {
            "ensgId": pair["ensgId"],
            "efoId": pair["efoId"]
        },
        "query": """
        query EvidenceProfileQuery($ensgId: String!, $efoId: String!) {
            target(ensemblId: $ensgId) {
                id
                approvedSymbol
                approvedName
                functionDescriptions
                synonyms {
                    label
                    source
                    __typename
                }
                __typename
            }
            disease(efoId: $efoId) {
                id
                name
                description
                synonyms {
                    terms
                    relation
                    __typename
                }
                ...EvidenceProfileSummaryFragment
                __typename
            }
        }

        fragment EvidenceProfileSummaryFragment on Disease {
            ...CancerBiomarkersEvidenceFragment
            ...CancerGeneCensusSummary
            ...ChemblSummaryFragment
            ...ClinGenSummaryFragment
            ...crisprSummary
            ...CrisprScreenSummary
            ...EuropePmcSummaryFragment
            ...evaSummary
            ...evaSomaticSummary
            ...expressionAtlasSummary
            ...Gene2PhenotypeSummaryFragment
            ...GenomicsEnglandSummaryFragment
            ...EvidenceGWASCredibleSetsSummaryFragment
            ...IMCPSummaryFragment
            ...IntOgenSummaryFragment
            ...geneBurdenSummary
            ...OrphanetSummaryFragment
            ...OtCrisprSummary
            ...otEncoreSummary
            ...otValidationSummary
            ...ProgenySummaryFragment
            ...reactomeSummary
            ...SlapEnrichSummaryFragment
            ...SysBioSummaryFragment
            ...UniprotLiteratureSummary
            ...UniprotVariantsSummary
            __typename
        }

        fragment CancerBiomarkersEvidenceFragment on Disease {
            cancerBiomarkersSummary: evidences(
                ensemblIds: [$ensgId]
                enableIndirect: true
                datasourceIds: ["cancer_biomarkers"]
                size: 0
            ) {
                count
                __typename
            }
            __typename
        }

        fragment CancerGeneCensusSummary on Disease {
            cancerGeneCensusSummary: evidences(
                ensemblIds: [$ensgId]
                enableIndirect: true
                datasourceIds: ["cancer_gene_census"]
                size: 0
            ) {
                count
                __typename
            }
            __typename
        }

        fragment ChemblSummaryFragment on Disease {
            chembl: evidences(
                ensemblIds: [$ensgId]
                enableIndirect: true
                datasourceIds: ["chembl"]
                size: 0
            ) {
                count
                __typename
            }
            __typename
        }

        fragment ClinGenSummaryFragment on Disease {
            clingenSummary: evidences(
                ensemblIds: [$ensgId]
                enableIndirect: true
                datasourceIds: ["clingen"]
                size: 0
            ) {
                count
                __typename
            }
            __typename
        }

        fragment crisprSummary on Disease {
            crisprSummary: evidences(
                ensemblIds: [$ensgId]
                enableIndirect: true
                datasourceIds: ["crispr"]
                size: 0
            ) {
                count
                __typename
            }
            __typename
        }

        fragment CrisprScreenSummary on Disease {
            CrisprScreenSummary: evidences(
                ensemblIds: [$ensgId]
                enableIndirect: true
                datasourceIds: ["crispr_screen"]
                size: 0
            ) {
                count
                __typename
            }
            __typename
        }

        fragment EuropePmcSummaryFragment on Disease {
            europePmc: evidences(
                ensemblIds: [$ensgId]
                enableIndirect: true
                datasourceIds: ["europepmc"]
                size: 0
            ) {
                count
                __typename
            }
            __typename
        }

        fragment evaSummary on Disease {
            eva: evidences(
                ensemblIds: [$ensgId]
                enableIndirect: true
                datasourceIds: ["eva"]
                size: 0
            ) {
                count
                __typename
            }
            __typename
        }

        fragment evaSomaticSummary on Disease {
            eva_somatic: evidences(
                ensemblIds: [$ensgId]
                enableIndirect: true
                datasourceIds: ["eva_somatic"]
                size: 0
            ) {
                count
                __typename
            }
            __typename
        }

        fragment expressionAtlasSummary on Disease {
            expressionAtlasSummary: evidences(
                ensemblIds: [$ensgId]
                enableIndirect: true
                datasourceIds: ["expression_atlas"]
                size: 0
            ) {
                count
                __typename
            }
            __typename
        }

        fragment Gene2PhenotypeSummaryFragment on Disease {
            gene2Phenotype: evidences(
                ensemblIds: [$ensgId]
                enableIndirect: true
                datasourceIds: ["gene2phenotype"]
                size: 0
            ) {
                count
                __typename
            }
            __typename
        }

        fragment GenomicsEnglandSummaryFragment on Disease {
            genomicsEngland: evidences(
                ensemblIds: [$ensgId]
                enableIndirect: true
                datasourceIds: ["genomics_england"]
                size: 0
            ) {
                count
                __typename
            }
            __typename
        }

        fragment EvidenceGWASCredibleSetsSummaryFragment on Disease {
            gwasCredibleSets: evidences(
                ensemblIds: [$ensgId]
                enableIndirect: true
                datasourceIds: ["gwas_credible_sets"]
                size: 0
            ) {
                count
                __typename
            }
            __typename
        }

        fragment IMCPSummaryFragment on Disease {
            impc: evidences(
                ensemblIds: [$ensgId]
                enableIndirect: true
                datasourceIds: ["impc"]
                size: 0
            ) {
                count
                __typename
            }
            __typename
        }

        fragment IntOgenSummaryFragment on Disease {
            intOgen: evidences(
                ensemblIds: [$ensgId]
                enableIndirect: true
                datasourceIds: ["intogen"]
                size: 0
            ) {
                count
                __typename
            }
            __typename
        }

        fragment geneBurdenSummary on Disease {
            geneBurdenSummary: evidences(
                ensemblIds: [$ensgId]
                enableIndirect: true
                datasourceIds: ["gene_burden"]
                size: 0
            ) {
                count
                __typename
            }
            __typename
        }

        fragment OrphanetSummaryFragment on Disease {
            orphanetSummary: evidences(
                ensemblIds: [$ensgId]
                enableIndirect: true
                datasourceIds: ["orphanet"]
                size: 0
            ) {
                count
                __typename
            }
            __typename
        }

        fragment OtCrisprSummary on Disease {
            OtCrisprSummary: evidences(
                ensemblIds: [$ensgId]
                enableIndirect: true
                datasourceIds: ["ot_crispr"]
                size: 0
            ) {
                count
                __typename
            }
            __typename
        }

        fragment otEncoreSummary on Disease {
            otEncoreSummary: evidences(
                ensemblIds: [$ensgId]
                enableIndirect: true
                datasourceIds: ["encore"]
                size: 0
            ) {
                count
                __typename
            }
            __typename
        }

        fragment otValidationSummary on Disease {
            otValidationSummary: evidences(
                ensemblIds: [$ensgId]
                enableIndirect: true
                datasourceIds: ["ot_crispr_validation"]
                size: 0
            ) {
                count
                __typename
            }
            __typename
        }

        fragment ProgenySummaryFragment on Disease {
            progeny: evidences(
                ensemblIds: [$ensgId]
                enableIndirect: true
                datasourceIds: ["progeny"]
                size: 0
            ) {
                count
                __typename
            }
            __typename
        }

        fragment reactomeSummary on Disease {
            reactomeSummary: evidences(
                ensemblIds: [$ensgId]
                enableIndirect: true
                datasourceIds: ["reactome"]
                size: 0
            ) {
                count
                __typename
            }
            __typename
        }

        fragment SlapEnrichSummaryFragment on Disease {
            slapEnrich: evidences(
                ensemblIds: [$ensgId]
                enableIndirect: true
                datasourceIds: ["slapenrich"]
                size: 0
            ) {
                count
                __typename
            }
            __typename
        }

        fragment SysBioSummaryFragment on Disease {
            sysBio: evidences(
                ensemblIds: [$ensgId]
                enableIndirect: true
                datasourceIds: ["sysbio"]
                size: 0
            ) {
                count
                __typename
            }
            __typename
        }

        fragment UniprotLiteratureSummary on Disease {
            uniprotLiteratureSummary: evidences(
                ensemblIds: [$ensgId]
                enableIndirect: true
                datasourceIds: ["uniprot_literature"]
                size: 0
            ) {
                count
                __typename
            }
            __typename
        }

        fragment UniprotVariantsSummary on Disease {
            uniprotVariantsSummary: evidences(
                ensemblIds: [$ensgId]
                enableIndirect: true
                datasourceIds: ["uniprot_variants"]
                size: 0
            ) {
                count
                __typename
            }
            __typename
        }
    """
    }

    response = requests.post(url, headers=headers, json=payload)
    if response.status_code == 200:
        try:
            data = response.json()
            disease = data.get("data", {}).get("disease", {})
            target = data.get("data", {}).get("target", {})

            record = {
                "ensgId": pair["ensgId"],
                "efoId": pair["efoId"],
                "Target": target.get("approvedSymbol", ""),
                "Target Name": target.get("approvedName", ""),
                "Disease": disease.get("name", ""),
                "Function Descriptions": "\n".join(target.get("functionDescriptions", []))
            }

            # Extract evidence counts from summary fields
            summary_fields = [
                "cancerBiomarkersSummary", "cancerGeneCensusSummary", "chembl", "clingenSummary",
                "crisprSummary", "CrisprScreenSummary", "europePmc", "eva", "eva_somatic",
                "expressionAtlasSummary", "gene2Phenotype", "genomicsEngland", "gwasCredibleSets",
                "impc", "intOgen", "geneBurdenSummary", "orphanetSummary", "OtCrisprSummary",
                "otEncoreSummary", "otValidationSummary", "progeny", "reactomeSummary",
                "slapEnrich", "sysBio", "uniprotLiteratureSummary", "uniprotVariantsSummary"
            ]

            for field in summary_fields:
                record[field] = disease.get(field, {}).get("count", 0)

            results.append(record)

        except Exception as e:
            print(f"Error processing response for {pair['ensgId']} and {pair['efoId']}: {e}")
    else:
        print(f"Failed to fetch data for {pair['ensgId']} and {pair['efoId']} with status {response.status_code}")

    sleep(1)

# Save to Excel
df = pd.DataFrame(results)
df.to_excel("evidence_summary.xlsx", index=False)
print("Saved results to evidence_summary.xlsx")