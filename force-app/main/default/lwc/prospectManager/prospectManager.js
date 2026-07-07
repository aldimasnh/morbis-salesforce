import { LightningElement, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getProspects from '@salesforce/apex/ProspectController.getProspects';
import getProspectById from '@salesforce/apex/ProspectController.getProspectById';
import createProspect from '@salesforce/apex/ProspectController.createProspect';
import markAsQualified from '@salesforce/apex/ProspectController.markAsQualified';

export default class ProspectManager extends LightningElement {

    columns = [
        {
            label: 'Name',
            fieldName: 'Name'
        },
        {
            label: 'Company',
            fieldName: 'Company__c'
        },
        {
            label: 'Email',
            fieldName: 'Email__c'
        },
        {
            label: 'Status',
            fieldName: 'Status__c'
        }
    ];

    prospects = [];

    name = '';
    company = '';
    email = '';

    wiredResult;

    selectedProspectId;
    selectedProspect;

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }

    @wire(getProspects)
    wiredProspects(result) {
        this.wiredResult = result;

        if (result.data) {
            this.prospects = result.data;
        } else if (result.error) {
            console.error(result.error);
        }
    }

    handleNameChange(event) {
        this.name = event.target.value;
    }

    handleCompanyChange(event) {
        this.company = event.target.value;
    }

    handleEmailChange(event) {
        this.email = event.target.value;
    }

    async handleSave() {
        try {

            await createProspect({
                name: this.name,
                company: this.company,
                email: this.email
            });

            this.name = '';
            this.company = '';
            this.email = '';

            await refreshApex(this.wiredResult);

            this.showToast(
                'Success',
                'Prospect created successfully.',
                'success'
            );

        } catch (e) {
            console.error(e);

            this.showToast(
                'Error',
                'Failed to update prospect.',
                'error'
            );
        }
    }

    async handleRowSelection(event) {

        const rows = event.detail.selectedRows;

        if (!rows.length) {
            this.selectedProspect = null;
            return;
        }

        this.selectedProspectId = rows[0].Id;

        this.selectedProspect = await getProspectById({
            prospectId: this.selectedProspectId
        });
    }

    get canMarkQualified() {
        return this.selectedProspect &&
            this.selectedProspect.Status__c !== 'Qualified';
    }

    async handleMarkAsQualified() {
        try {

            await markAsQualified({
                prospectId: this.selectedProspect.Id
            });

            await refreshApex(this.wiredResult);

            this.selectedProspect = await getProspectById({
                prospectId: this.selectedProspect.Id
            });

            this.showToast(
                'Success',
                'Prospect status updated successfully.',
                'success'
            );

        } catch (e) {
            console.error(e);

            this.showToast(
                'Error',
                'Failed to update status.',
                'error'
            );
        }
    }
}