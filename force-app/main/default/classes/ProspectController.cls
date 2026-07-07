public with sharing class ProspectController {
    @AuraEnabled(cacheable=true)
    public static List<Prospect__c> getProspects() {
        return [
            SELECT
                Id,
                Name,
                Company__c,
                Email__c,
                Status__c,
                Qualified_Date__c
            FROM Prospect__c
            ORDER BY CreatedDate DESC
        ];
    }

    @AuraEnabled
    public static Prospect__c getProspectById(Id prospectId) {
        return [
            SELECT
                Id,
                Name,
                Company__c,
                Email__c,
                Status__c,
                Qualified_Date__c
            FROM Prospect__c
            WHERE Id = :prospectId
            LIMIT 1
        ];
    }

    @AuraEnabled
    public static void createProspect(
        String name,
        String company,
        String email
    ) {

        Prospect__c p = new Prospect__c();

        p.Name = name;
        p.Company__c = company;
        p.Email__c = email;
        p.Status__c = 'New';

        insert p;
    }

    @AuraEnabled
    public static void markAsQualified(Id prospectId) {

        Prospect__c p = [
            SELECT
                Id,
                Status__c
            FROM Prospect__c
            WHERE Id = :prospectId
            LIMIT 1
        ];

        p.Status__c = 'Qualified';
        p.Qualified_Date__c = System.now();

        update p;
    }
}