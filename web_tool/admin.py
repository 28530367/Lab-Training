from django.contrib import admin
from web_tool.models import Geneid, GeneCodingTranscript

class GeneidAdmin(admin.ModelAdmin): 
    list_display = ('wormbase_id','gene_sequqnce_name','gene_name','other_name','transcript_id','numbers')
    search_fields = ('wormbase_id','gene_sequqnce_name','gene_name','other_name', 'transcript_id') 
admin.site.register(Geneid, GeneidAdmin) 

class GeneCodingTranscriptAdmin(admin.ModelAdmin): 
    list_display = ('wormbase_id','gene_name','coding_transcript','transcript_id')
    search_fields = ('wormbase_id','gene_name','coding_transcript','transcript_id') 
admin.site.register(GeneCodingTranscript, GeneCodingTranscriptAdmin) 
