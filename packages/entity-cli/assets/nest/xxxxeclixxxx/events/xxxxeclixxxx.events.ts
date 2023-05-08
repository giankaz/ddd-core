import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ActivateXxxxeclixxxxUseCase,
  CreateXxxxeclixxxxUseCase,
  DeleteXxxxeclixxxxUseCase,
  Event,
  InactivateXxxxeclixxxxUseCase,
  SoftDeleteXxxxeclixxxxUseCase,
  UpdateXxxxeclixxxxUseCase,
} from 'core';
import {
  XXXXECLIXXXX_ACTIVATED,
  XXXXECLIXXXX_CREATED,
  XXXXECLIXXXX_DELETED,
  XXXXECLIXXXX_INACTIVATED,
  XXXXECLIXXXX_SOFTDELETED,
  XXXXECLIXXXX_UPDATED,
} from '../xxxxeclixxxx.constants';

@Injectable()
export class XxxxeclixxxxEventListeners {
  @OnEvent(XXXXECLIXXXX_CREATED, { async: true })
  async xxxxeclixxxxCreatedEvent(
    payload: Event<CreateXxxxeclixxxxUseCase.Output>,
  ) {
    // do something after xxxxeclixxxx is created
  }

  @OnEvent(XXXXECLIXXXX_ACTIVATED, { async: true })
  async xxxxeclixxxxActivatedEvent(
    payload: Event<ActivateXxxxeclixxxxUseCase.Output>,
  ) {
    // do something after xxxxeclixxxx is activated
  }

  @OnEvent(XXXXECLIXXXX_INACTIVATED, { async: true })
  async xxxxeclixxxxInactivatedEvent(
    payload: Event<InactivateXxxxeclixxxxUseCase.Output>,
  ) {
    // do something after xxxxeclixxxx is inactivated
  }

  @OnEvent(XXXXECLIXXXX_UPDATED, { async: true })
  async xxxxeclixxxxUpdatedEvent(
    payload: Event<UpdateXxxxeclixxxxUseCase.Output>,
  ) {
    // do something after xxxxeclixxxx is updated
  }

  @OnEvent(XXXXECLIXXXX_DELETED, { async: true })
  async xxxxeclixxxxDeletedEvent(
    payload: Event<DeleteXxxxeclixxxxUseCase.Output>,
  ) {
    // do something after xxxxeclixxxx is deleted
  }

  @OnEvent(XXXXECLIXXXX_SOFTDELETED, { async: true })
  async xxxxeclixxxxSoftDeletedEvent(
    payload: Event<SoftDeleteXxxxeclixxxxUseCase.Output>,
  ) {
    // do something after xxxxeclixxxx is soft deleted
  }
}
