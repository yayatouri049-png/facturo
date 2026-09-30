#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: "Générateur de factures Facturo (3 devises DA/EUR/USD, 3 langues FR/AR-RTL/EN). Ajout des mentions légales algériennes (RC, AI, forme juridique, capital, NIF client, Total TTC, montant en toutes lettres, cachet et signature), symbole DZD localisé en arabe (دج), et correction du bug d'ordonnancement bidi RTL des nombres."

frontend:
  - task: "Correction ordre bidi RTL des nombres (isolation LTR + espaces insécables)"
    implemented: true
    working: true
    file: "frontend/src/components/InvoicePreview.jsx, frontend/src/lib/invoiceUtils.js, frontend/src/components/InvoiceForm.jsx, frontend/src/components/InvoiceHistory.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "BUG signalé par l'utilisateur: en mode arabe (RTL), les nombres avec séparateurs de milliers s'affichent à l'envers (ex: '1 000 000 DA' -> '000 000 1 DA'). FIX appliqué: (1) formatMoney utilise des espaces insécables U+00A0; (2) chaque nombre/montant + devise entouré d'un <bdi dir='ltr' style='unicode-bidi:isolate'> (composant Ltr dans InvoicePreview, inline bdi dans Form/History); (3) même isolation LTR appliquée à IBAN, NIF, RC, AI, téléphones, emails, dates, numéro de facture, et au capital dans la ligne légale du pied de page. Aucun changement en FR/EN (l'isolation LTR est neutre en contexte LTR). À TESTER en arabe: basculer la langue via le sélecteur (option 'العربية'), vérifier avec devise DZD que 1 000 000, 171 360,00 et 2 000 000 s'affichent dans le bon ordre (gauche->droite) avec le symbole دج APRES le nombre, dans: prix unitaires, Total HT lignes, Sous-total HT, TVA, Total TTC, capital social (pied), et que le montant en toutes lettres reste correct. Vérifier aussi que FR et EN sont inchangés."
        -working: true
        -agent: "testing"
        -comment: "✅ BUG FIX VERIFIED - Comprehensive testing completed with all test amounts (1 000 000, 171 360, 2 000 000 DZD). ARABIC MODE: All numbers display in correct left-to-right order. Total TTC shows '1 000 000,00 دج' (NOT reversed '000 000 1'). Arabic dinar symbol (دج) correctly appears AFTER the number. Verified in all locations: Total TTC, Subtotal HT, VAT, unit prices, line totals, capital in footer (shows '1 000 000 DA'), and amount-in-words block present. No reversed patterns detected. REGRESSION TESTS PASSED: French and English modes display '2 000 000,00 DA' correctly with no issues. The LTR isolation (<bdi dir='ltr'>) and non-breaking spaces (U+00A0) are working perfectly. Screenshots captured for visual confirmation."

metadata:
  created_by: "main_agent"
  version: "1.1"
  test_sequence: 1
  run_ui: false

test_plan:
  current_focus:
    - "Correction ordre bidi RTL des nombres (isolation LTR + espaces insécables)"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
    -agent: "main"
    -message: "Correctif du bug RTL des nombres appliqué (isolation LTR bdi + NBSP). Merci de tester UNIQUEMENT le frontend en mode ARABE avec devise DZD sur les montants 1 000 000, 171 360,00 et 2 000 000 pour confirmer que l'ordre des chiffres est correct partout (aperçu A4). Vérifier aussi que FR/EN restent inchangés. App 100% frontend, aucune auth, données par défaut chargées automatiquement (localStorage vide)."
    -agent: "testing"
    -message: "✅ TESTING COMPLETE - Bug fix verified successfully. All test scenarios passed. Arabic RTL mode: numbers display in correct left-to-right order (1 000 000, 171 360, 2 000 000) with Arabic dinar symbol (دج) after numbers. No reversed patterns detected. French and English modes: no regression, numbers display correctly. All locations verified: Total TTC, Subtotal HT, VAT, unit prices, line totals, capital in footer, amount-in-words. The fix is working perfectly. Ready for main agent to summarize and finish."