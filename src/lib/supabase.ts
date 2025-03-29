
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oncudjiacscrgcprmrgk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uY3VkamlhY3NjcmdjcHJtcmdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyNjQ3NjAsImV4cCI6MjA1ODg0MDc2MH0.I-llsTbLUHQiwZtv5yH228gZ1N_0Ja1zN1CWpLdFPoY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
