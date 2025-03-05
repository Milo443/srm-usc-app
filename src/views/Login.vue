<template>
    <ion-page>
        <ion-header>
            <!-- <ion-toolbar>
                <ion-title>Login</ion-title>
            </ion-toolbar> -->
        </ion-header>

        <ion-content>
            <ion-card>
                <ion-card-header>
                    <ion-card-title>Login</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                    <ion-list lines="none">
                        <ion-item>
                            <ion-input
                            label="Email"
                            label-placement = "stacked"
                            placeholder="alan.brito00@usc.edu.co"
                            ></ion-input>
                        </ion-item>
                        <ion-item>
                            <ion-input
                            type = 'password'
                            label= "Password"
                            label-placement = "stacked">
                                <ion-input-password-toggle slot="end"></ion-input-password-toggle>
                            </ion-input>
                        </ion-item>
                        <ion-item>
                            <ion-button  expand="block" shape="round">Login</ion-button>
                        </ion-item>
                    </ion-list>
                    

                    
                </ion-card-content>
            </ion-card>
        </ion-content>

    </ion-page>
</template>