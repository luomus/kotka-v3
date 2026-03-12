import { Test } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { CallHandler, ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { ApiServicesModule, LajiStoreService, Media, MediaApiService, MediasEnum } from '@kotka/api/services';
import { Reflector } from '@nestjs/core';
import { of, lastValueFrom, Observable } from 'rxjs';
import { AxiosResponse } from '@nestjs/terminus/dist/health-indicator/http/axios.interfaces';
import { MediaAccessInterceptor } from './media-access.interceptor';
import { KotkaDocumentObjectFullType } from '@kotka/shared/models';

const kotkaAdminUser = {
  role: [''],
  roleKotka: 'MA.admin',
  organisation: ['MOS.3']
}

const adminUser = {
  role: ['MA.admin'],
  roleKotka: 'MA.guest',
  organisation: ['MOS.3']
}

const MOS1User = {
  role: [''],
  roleKotka: 'MA.member',
  organisation: ['MOS.1']
}

const MOS2User = {
  role: [''],
  roleKotka: 'MA.member',
  organisation: ['MOS.2']
}

const MOS4User = {
  role: [''],
  roleKotka: 'MA.member',
  organisation: ['MOS.4']
}

const multiOrgUser = {
  role: [''],
  roleKotka: 'MA.member',
  organisation: ['MOS.1', 'MOS.2', 'MOS.3']
}

const advancedUser = {
  role: [''],
  roleKotka: 'MA.advanced',
  organisation: ['MOS.1']
}

const guestUser = {
  role: [''],
  roleKotka: 'MA.guest',
  organisation: []
}

const MOS1Doc = {
  id: 'JX.1',
  owner: 'MOS.1',
}

const MOS1Doc2 = {
  id: 'JX.4',
  owner: 'MOS.1',
}

const MOS2Doc = {
  id: 'JX.2',
  owner: 'MOS.2',
}

const MOS3Doc = {
  id: 'JX.3',
  owner: 'MOS.3',
}

const imgMetadata1 = {
  id: 'MM.1',
  documentURI: ["http://tun.fi/JX.1"],
}

const imgTripleMeta1 = {
  id: 'MM.1',
  urls: {},
  meta: {
    documentIds: ['http://tun.fi/JX.1']
  }
}

const imgMetadata2 = {
  id: 'MM.2',
  documentURI: ["http://tun.fi/JX.2"],
}

const imgTripleMeta2 = {
  id: 'MM.2',
  urls: {},
  meta: {
    documentIds: ['http://tun.fi/JX.2']
  }
}

const imgMetadata3 = {
  id: 'MM.3',
  documentURI: [
    "http://tun.fi/JX.1",
    "http://tun.fi/JX.2",
    "http://id.luomus.fi/JX.3"
  ],
}

const imgTripleMeta3 = {
  id: 'MM.3',
  urls: {},
  meta: {
    documentIds: [
      'http://tun.fi/JX.1',
      'http://tun.fi/JX.2',
      'http://id.luomus.fi/JX.3'
    ]
  }
}

const imgMetadata4 = {
  id: 'MM.4',
  documentURI: [
    "http://tun.fi/JX.1",
    "http://tun.fi/JX.4"
  ]
}

const imgTripleMeta4 = {
  id: 'MM.4',
  urls: {},
  meta: {
    documentIds: [
      "http://tun.fi/JX.1",
      "http://tun.fi/JX.4"
    ]
  }
}

const pdfMetadata = {
  intellectualOwner: 'MOS.2'
}

const pdfTriplesMeta = {
  id: 'MM.1',
  urls: {},
  meta: {
    rightsOwner: 'MOS.2'
  }
}

describe('MediaAccessInterceptor', () => {
  let mediaAccessInterceptor: MediaAccessInterceptor;
  let lajiStoreService: LajiStoreService;
  let mediaApiService: MediaApiService;
  let reflector: Reflector;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ApiServicesModule],
      controllers: [],
      providers: [Reflector, MediaAccessInterceptor],
    }).compile();

    mediaAccessInterceptor = moduleRef.get<MediaAccessInterceptor>(MediaAccessInterceptor);
    lajiStoreService = moduleRef.get<LajiStoreService>(LajiStoreService);
    mediaApiService = moduleRef.get<MediaApiService>(MediaApiService);
    reflector = moduleRef.get<Reflector>(Reflector);

  });

  describe('General tests', () => {
    it('If profile is missing throw an error', async () => {
      const mockContext = createMock<ExecutionContext>({ switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          user: {}
        })
      })});

      const mockNext = createMock<CallHandler>();

            expect.assertions(2);
      try {
        await mediaAccessInterceptor.intercept(mockContext, mockNext);
      } catch (e) {
        expect(e.message).toEqual('Missing user data');
        expect(mockNext.handle).toHaveBeenCalledTimes(0);
      }
    });

    it('If type parameter is missing throw error', async () => {
      const mockContext = createMock<ExecutionContext>({ switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          params: {},
          user: {
            profile: adminUser
          }
        })
      })});

      const mockNext = createMock<CallHandler>();

      expect.assertions(2);
      try {
        await mediaAccessInterceptor.intercept(mockContext, mockNext);
      } catch (e) {
        expect(e.message).toEqual('Missing type parameter');
        expect(mockNext.handle).toHaveBeenCalledTimes(0);
      }
    });
  });

  describe('PDF:s', () => {
    describe('POST', () => {
      it('Admin can post', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'POST',
            params: {
              type: MediasEnum.pdf,
            },
            user: {
              profile: adminUser
            },
            body: pdfMetadata,
          })
        })});

        const mockNext = createMock<CallHandler>();

        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia');

        await mediaAccessInterceptor.intercept(mockContext, mockNext);

        expect(mockGetMedia).toHaveBeenCalledTimes(0);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
      });

      it('Kotka admin can post', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'POST',
            params: {
              type: MediasEnum.pdf,
            },
            user: {
              profile: kotkaAdminUser
            },
            body: pdfMetadata,
          })
        })});

        const mockNext = createMock<CallHandler>();

        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia');

        await mediaAccessInterceptor.intercept(mockContext, mockNext);

        expect(mockGetMedia).toHaveBeenCalledTimes(0);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
      });

      it('User with ownership of document can post', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'POST',
            params: {
              type: MediasEnum.pdf,
            },
            user: {
              profile: MOS2User
            },
            body: pdfMetadata,
          })
        })});

        const mockNext = createMock<CallHandler>();

        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia');

        await mediaAccessInterceptor.intercept(mockContext, mockNext);

        expect(mockGetMedia).toHaveBeenCalledTimes(0);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
      });

      it('User without ownership of document cant post', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'POST',
            params: {
              type: MediasEnum.pdf,
            },
            user: {
              profile: MOS1User
            },
            body: pdfMetadata,
          })
        })});

        const mockNext = createMock<CallHandler>();

        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia');

        expect.assertions(4);

        try {
          await mediaAccessInterceptor.intercept(mockContext, mockNext);
        } catch (e) {
          expect(e.status).toBe(403);
          expect(e.message).toBe('Forbidden');
          expect(mockGetMedia).toHaveBeenCalledTimes(0);
          expect(mockNext.handle).toHaveBeenCalledTimes(0);
        }
      });
    })

    describe('GET', () => {
      it('Admin can get', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'GET',
            params: {
              type: MediasEnum.pdf,
              id: 'MM.1'
            },
            user: {
              profile: adminUser
            },
          })
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(mockNext, 'handle').mockImplementation(() => of(pdfMetadata));

        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia');

        const res = await lastValueFrom(await mediaAccessInterceptor.intercept(mockContext, mockNext));

        expect(res).toEqual(pdfMetadata);
        expect(mockGetMedia).toHaveBeenCalledTimes(0);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
      });

      it('Kotka admin can get', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'GET',
            params: {
              type: MediasEnum.pdf,
              id: 'MM.1'
            },
            user: {
              profile: kotkaAdminUser
            },
          })
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(mockNext, 'handle').mockImplementation(() => of(pdfMetadata));

        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia');

        const res = await lastValueFrom(await mediaAccessInterceptor.intercept(mockContext, mockNext));

        expect(res).toEqual(pdfMetadata);
        expect(mockGetMedia).toHaveBeenCalledTimes(0);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
      });

      it('User with ownership of document can get', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'GET',
            params: {
              type: MediasEnum.pdf,
              id: 'MM.1'
            },
            user: {
              profile: MOS2User
            },
          })
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(mockNext, 'handle').mockImplementation(() => of(pdfMetadata));

        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia');

        const res = await lastValueFrom(await mediaAccessInterceptor.intercept(mockContext, mockNext));

        expect(res).toEqual(pdfMetadata);
        expect(mockGetMedia).toHaveBeenCalledTimes(0);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
      });

      it('User without ownership of document cant get', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'GET',
            params: {
              type: MediasEnum.pdf,
              id: 'MM.1'
            },
            user: {
              profile: MOS1User
            },
          })
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(mockNext, 'handle').mockImplementation(() => of(pdfMetadata));

        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia');

        expect.assertions(4);

        try {
        const res = await lastValueFrom(await mediaAccessInterceptor.intercept(mockContext, mockNext));
        } catch (e) {
          expect(e.status).toBe(403);
          expect(e.message).toBe('Forbidden');
          expect(mockGetMedia).toHaveBeenCalledTimes(0);
          expect(mockNext.handle).toHaveBeenCalledTimes(1);
        }
      });
    })

    describe('PUT', () => {
      it('Admin can edit', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'PUT',
            params: {
              type: MediasEnum.pdf,
              id: 'MM.1'
            },
            body: pdfMetadata,
            user: {
              profile: adminUser
            },
          })
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(mockNext, 'handle');

        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia');

        await mediaAccessInterceptor.intercept(mockContext, mockNext);

        expect(mockGetMedia).toHaveBeenCalledTimes(0);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
      });

      it('Kotka admin can edit', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'PUT',
            params: {
              type: MediasEnum.pdf,
              id: 'MM.1'
            },
            body: pdfMetadata,
            user: {
              profile: kotkaAdminUser
            },
          })
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(mockNext, 'handle');

        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia');

        await mediaAccessInterceptor.intercept(mockContext, mockNext);

        expect(mockGetMedia).toHaveBeenCalledTimes(0);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
      });

      it('User with ownership of document can edit', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'PUT',
            params: {
              type: MediasEnum.pdf,
              id: 'MM.1'
            },
            body: pdfMetadata,
            user: {
              profile: MOS2User
            },
          })
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(mockNext, 'handle');

        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia').mockImplementation(() => of(pdfTriplesMeta as Media));

        await mediaAccessInterceptor.intercept(mockContext, mockNext);

        expect(mockGetMedia).toHaveBeenCalledTimes(1);
        expect(mockGetMedia.mock.calls[0][0]).toBe('MM.1');
        expect(mockGetMedia.mock.calls[0][1]).toBe(MediasEnum.pdf);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
      });

      it('User without ownership of document cant edit', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'PUT',
            params: {
              type: MediasEnum.pdf,
              id: 'MM.1'
            },
            body: pdfMetadata,
            user: {
              profile: MOS1User
            },
          })
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(mockNext, 'handle');

        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia').mockImplementation(() => of(pdfTriplesMeta as Media));

        try {
          await mediaAccessInterceptor.intercept(mockContext, mockNext);
        } catch (e) {
          expect(e.status).toBe(403);
          expect(e.message).toBe('Forbidden');
          expect(mockGetMedia).toHaveBeenCalledTimes(1);
          expect(mockGetMedia.mock.calls[0][0]).toBe('MM.1');
          expect(mockGetMedia.mock.calls[0][1]).toBe(MediasEnum.pdf);
          expect(mockNext.handle).toHaveBeenCalledTimes(0);
        }
      });
    })

    describe('DELETE', () => {
      it('Admin can delete', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'DELETE',
            params: {
              type: MediasEnum.pdf,
              id: 'MM.1'
            },
            user: {
              profile: adminUser
            },
          })
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(mockNext, 'handle');

        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia');

        await mediaAccessInterceptor.intercept(mockContext, mockNext);

        expect(mockGetMedia).toHaveBeenCalledTimes(0);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
      });

      it('Kotka admin can delete', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'DELETE',
            params: {
              type: MediasEnum.pdf,
              id: 'MM.1'
            },
            user: {
              profile: kotkaAdminUser
            },
          })
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(mockNext, 'handle');

        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia');

        await mediaAccessInterceptor.intercept(mockContext, mockNext);

        expect(mockGetMedia).toHaveBeenCalledTimes(0);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
      });

      it('User with ownership of document can delete', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'DELETE',
            params: {
              type: MediasEnum.pdf,
              id: 'MM.1'
            },
            user: {
              profile: MOS2User
            },
          })
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(mockNext, 'handle');

        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia').mockImplementation(() => of(pdfTriplesMeta as Media));

        await mediaAccessInterceptor.intercept(mockContext, mockNext);

        expect(mockGetMedia).toHaveBeenCalledTimes(1);
        expect(mockGetMedia.mock.calls[0][0]).toBe('MM.1');
        expect(mockGetMedia.mock.calls[0][1]).toBe(MediasEnum.pdf);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
      });

      it('User without ownership of document cant delete', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'DELETE',
            params: {
              type: MediasEnum.pdf,
              id: 'MM.1'
            },
            user: {
              profile: MOS1User
            },
          })
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(mockNext, 'handle');

        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia').mockImplementation(() => of(pdfTriplesMeta as Media));

        try {
          await mediaAccessInterceptor.intercept(mockContext, mockNext);
        } catch (e) {
          expect(e.status).toBe(403);
          expect(e.message).toBe('Forbidden');
          expect(mockGetMedia).toHaveBeenCalledTimes(1);
          expect(mockGetMedia.mock.calls[0][0]).toBe('MM.1');
          expect(mockGetMedia.mock.calls[0][1]).toBe(MediasEnum.pdf);
          expect(mockNext.handle).toHaveBeenCalledTimes(0);
        }
      });
    })
  })

  describe('Images', () => {
    describe('POST', () => {
      it('Admin can add with one documentURI', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'POST',
            params: {
              type: MediasEnum.images,
            },
            user: {
              profile: adminUser
            },
            body: imgMetadata1,
          })
        })});

        const mockNext = createMock<CallHandler>();

        const mockGet = jest.spyOn(lajiStoreService, 'get');
        const mockGetAll = jest.spyOn(lajiStoreService, 'getAll');
        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia');

        await mediaAccessInterceptor.intercept(mockContext, mockNext);

        expect(mockGet).toHaveBeenCalledTimes(0);
        expect(mockGetAll).toHaveBeenCalledTimes(0);
        expect(mockGetMedia).toHaveBeenCalledTimes(0);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
      });

      it('Admin can add with multiple documentURI', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'POST',
            params: {
              type: MediasEnum.images,
            },
            user: {
              profile: adminUser
            },
            body: imgMetadata3,
          })
        })});

        const mockNext = createMock<CallHandler>();

        const mockGet = jest.spyOn(lajiStoreService, 'get');
        const mockGetAll = jest.spyOn(lajiStoreService, 'getAll');
        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia');

        await mediaAccessInterceptor.intercept(mockContext, mockNext);

        expect(mockGet).toHaveBeenCalledTimes(0);
        expect(mockGetAll).toHaveBeenCalledTimes(0);
        expect(mockGetMedia).toHaveBeenCalledTimes(0);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
      });

      it('Kotka admin can add with one documentURI', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'POST',
            params: {
              type: MediasEnum.images,
            },
            user: {
              profile: kotkaAdminUser
            },
            body: imgMetadata1,
          })
        })});

        const mockNext = createMock<CallHandler>();

        const mockGet = jest.spyOn(lajiStoreService, 'get');
        const mockGetAll = jest.spyOn(lajiStoreService, 'getAll');
        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia');

        await mediaAccessInterceptor.intercept(mockContext, mockNext);

        expect(mockGet).toHaveBeenCalledTimes(0);
        expect(mockGetAll).toHaveBeenCalledTimes(0);
        expect(mockGetMedia).toHaveBeenCalledTimes(0);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
      });

      it('Kotka admin can add with multiple documentURI', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'POST',
            params: {
              type: MediasEnum.images,
            },
            user: {
              profile: kotkaAdminUser
            },
            body: imgMetadata3,
          })
        })});

        const mockNext = createMock<CallHandler>();

        const mockGet = jest.spyOn(lajiStoreService, 'get');
        const mockGetAll = jest.spyOn(lajiStoreService, 'getAll');
        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia');

        await mediaAccessInterceptor.intercept(mockContext, mockNext);

        expect(mockGet).toHaveBeenCalledTimes(0);
        expect(mockGetAll).toHaveBeenCalledTimes(0);
        expect(mockGetMedia).toHaveBeenCalledTimes(0);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
      });

      it('Owner of single documentURI can add', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'POST',
            params: {
              type: MediasEnum.images,
            },
            user: {
              profile: MOS1User
            },
            body: imgMetadata1,
          })
        })});

        const mockNext = createMock<CallHandler>();

        const mockGet = jest.spyOn(lajiStoreService, 'get').mockImplementation(() => of({ status: 200, statusText: '', headers: {}, config: {}, data: MOS1Doc} as AxiosResponse));
        const mockGetAll = jest.spyOn(lajiStoreService, 'getAll');
        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia');

        await mediaAccessInterceptor.intercept(mockContext, mockNext);

        expect(mockGet).toHaveBeenCalledTimes(1);
        expect(mockGet.mock.calls[0][0]).toBe(KotkaDocumentObjectFullType.document);
        expect(mockGet.mock.calls[0][1]).toBe('JX.1');
        expect(mockGetAll).toHaveBeenCalledTimes(0);
        expect(mockGetMedia).toHaveBeenCalledTimes(0);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
      });

      it('Not owner of single documentURI cant add', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'POST',
            params: {
              type: MediasEnum.images,
            },
            user: {
              profile: MOS1User
            },
            body: imgMetadata2,
          })
        })});

        const mockNext = createMock<CallHandler>();

        const mockGet = jest.spyOn(lajiStoreService, 'get').mockImplementation(() => of({ status: 200, statusText: '', headers: {}, config: {}, data: MOS2Doc} as AxiosResponse));
        const mockGetAll = jest.spyOn(lajiStoreService, 'getAll');
        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia');

        expect.assertions(8);

        try {
          await mediaAccessInterceptor.intercept(mockContext, mockNext);
        } catch (e) {
          expect(e.status).toBe(403);
          expect(e.message).toBe('Forbidden, no rights to document/s associated with the image');
          expect(mockGet).toHaveBeenCalledTimes(1);
          expect(mockGet.mock.calls[0][0]).toBe(KotkaDocumentObjectFullType.document);
          expect(mockGet.mock.calls[0][1]).toBe('JX.2');
          expect(mockGetAll).toHaveBeenCalledTimes(0);
          expect(mockGetMedia).toHaveBeenCalledTimes(0);
          expect(mockNext.handle).toHaveBeenCalledTimes(0);
        }
      });

      it('Owner of every one of multiple documentURIs can add', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'POST',
            params: {
              type: MediasEnum.images,
            },
            user: {
              profile: multiOrgUser
            },
            body: imgMetadata3,
          })
        })});

        const mockNext = createMock<CallHandler>();

        const mockGet = jest.spyOn(lajiStoreService, 'get')
        const mockGetAll = jest.spyOn(lajiStoreService, 'getAll').mockImplementation(() => of({ status: 200, statusText: '', headers: {}, config: {}, data: { member: [ MOS1Doc, MOS2Doc, MOS3Doc ]}} as AxiosResponse));
        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia');


        await mediaAccessInterceptor.intercept(mockContext, mockNext);

        expect(mockGet).toHaveBeenCalledTimes(0);
        expect(mockGetAll).toHaveBeenCalledTimes(1);
        expect(mockGetAll.mock.calls[0][0]).toBe(KotkaDocumentObjectFullType.document);
        expect(mockGetAll.mock.calls[0][1]).toStrictEqual({'fields': 'id,owner', 'q': 'id: "JX.1","JX.2","luomus:JX.3"'});
        expect(mockGetMedia).toHaveBeenCalledTimes(0);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
      });

      it('Owner of some of multiple documentURI can not add', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'POST',
            params: {
              type: MediasEnum.images,
            },
            user: {
              profile: MOS1User
            },
            body: imgMetadata3,
          })
        })});

        const mockNext = createMock<CallHandler>();

        const mockGet = jest.spyOn(lajiStoreService, 'get');
        const mockGetAll = jest.spyOn(lajiStoreService, 'getAll').mockImplementation(() => of({ status: 200, statusText: '', headers: {}, config: {}, data: { member: [ MOS1Doc, MOS2Doc, MOS3Doc ]}} as AxiosResponse));
        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia');

        expect.assertions(8);

        try {
          await mediaAccessInterceptor.intercept(mockContext, mockNext);
        } catch (e) {
          expect(e.status).toBe(403);
          expect(e.message).toBe('Forbidden, no rights to document/s associated with the image');
          expect(mockGetAll).toHaveBeenCalledTimes(1);
          expect(mockGet).toHaveBeenCalledTimes(0);
          expect(mockGetAll.mock.calls[0][0]).toBe(KotkaDocumentObjectFullType.document);
          expect(mockGetAll.mock.calls[0][1]).toStrictEqual({'fields': 'id,owner', 'q': 'id: "JX.1","JX.2","luomus:JX.3"'});
          expect(mockGetMedia).toHaveBeenCalledTimes(0);
          expect(mockNext.handle).toHaveBeenCalledTimes(0);
        }
      });

      it('Not owner of any of multiple documentURI can not add', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'POST',
            params: {
              type: MediasEnum.images,
            },
            user: {
              profile: MOS4User
            },
            body: imgMetadata3,
          })
        })});

        const mockNext = createMock<CallHandler>();

        const mockGet = jest.spyOn(lajiStoreService, 'get');
        const mockGetAll = jest.spyOn(lajiStoreService, 'getAll').mockImplementation(() => of({ status: 200, statusText: '', headers: {}, config: {}, data: { member: [ MOS1Doc, MOS2Doc, MOS3Doc ]}} as AxiosResponse));
        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia');

        expect.assertions(8);

        try {
          await mediaAccessInterceptor.intercept(mockContext, mockNext);
        } catch (e) {
          expect(e.status).toBe(403);
          expect(e.message).toBe('Forbidden, no rights to document/s associated with the image');
          expect(mockGetAll).toHaveBeenCalledTimes(1);
          expect(mockGet).toHaveBeenCalledTimes(0);
          expect(mockGetAll.mock.calls[0][0]).toBe(KotkaDocumentObjectFullType.document);
          expect(mockGetAll.mock.calls[0][1]).toStrictEqual({'fields': 'id,owner', 'q': 'id: "JX.1","JX.2","luomus:JX.3"'});
          expect(mockGetMedia).toHaveBeenCalledTimes(0);
          expect(mockNext.handle).toHaveBeenCalledTimes(0);
        }
      });
    });

    describe('GET', () => {
      it('Admin can get', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'GET',
            params: {
              type: MediasEnum.images,
            },
            user: {
              profile: adminUser
            }
          })
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(mockNext, 'handle').mockImplementation(() => of(imgMetadata1))

        const mockGet = jest.spyOn(lajiStoreService, 'get');
        const mockGetAll = jest.spyOn(lajiStoreService, 'getAll');
        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia');

        const res = await lastValueFrom(await mediaAccessInterceptor.intercept(mockContext, mockNext));

        expect(res).toEqual(imgMetadata1);

        expect(mockGet).toHaveBeenCalledTimes(0);
        expect(mockGetAll).toHaveBeenCalledTimes(0);
        expect(mockGetMedia).toHaveBeenCalledTimes(0);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
      });

      it('Kotka admin can get', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'GET',
            params: {
              type: MediasEnum.images,
            },
            user: {
              profile: kotkaAdminUser
            }
          })
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(mockNext, 'handle').mockImplementation(() => of(imgMetadata1));

        const mockGet = jest.spyOn(lajiStoreService, 'get');
        const mockGetAll = jest.spyOn(lajiStoreService, 'getAll');
        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia');

        const res = await lastValueFrom(await mediaAccessInterceptor.intercept(mockContext, mockNext));

        expect(res).toEqual(imgMetadata1);

        expect(mockGet).toHaveBeenCalledTimes(0);
        expect(mockGetAll).toHaveBeenCalledTimes(0);
        expect(mockGetMedia).toHaveBeenCalledTimes(0);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);

      });

      it('Owner can get', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'GET',
            params: {
              type: MediasEnum.images,
            },
            user: {
              profile: MOS4User
            }
          })
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(mockNext, 'handle').mockImplementation(() => of(imgMetadata1));

        const mockGet = jest.spyOn(lajiStoreService, 'get');
        const mockGetAll = jest.spyOn(lajiStoreService, 'getAll');
        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia');

        const res = await lastValueFrom(await mediaAccessInterceptor.intercept(mockContext, mockNext));

        expect(res).toEqual(imgMetadata1);

        expect(mockGet).toHaveBeenCalledTimes(0);
        expect(mockGetAll).toHaveBeenCalledTimes(0);
        expect(mockGetMedia).toHaveBeenCalledTimes(0);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
      });

      it('Non-owner can get', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'GET',
            params: {
              type: MediasEnum.images,
            },
            user: {
              profile: MOS4User
            }
          })
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(mockNext, 'handle').mockImplementation(() => of(imgMetadata1));

        const mockGet = jest.spyOn(lajiStoreService, 'get');
        const mockGetAll = jest.spyOn(lajiStoreService, 'getAll');
        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia');

        const res = await lastValueFrom(await mediaAccessInterceptor.intercept(mockContext, mockNext));

        expect(res).toEqual(imgMetadata1);

        expect(mockGet).toHaveBeenCalledTimes(0);
        expect(mockGetAll).toHaveBeenCalledTimes(0);
        expect(mockGetMedia).toHaveBeenCalledTimes(0);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
      });
    });

    describe('PUT', () => {
      it('Admin can edit with single documentURI', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'PUT',
            params: {
              type: MediasEnum.images,
              id: 'MM.1'
            },
            user: {
              profile: adminUser
            },
            body: imgMetadata1
          })
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(mockNext, 'handle');

        const mockGet = jest.spyOn(lajiStoreService, 'get');
        const mockGetAll = jest.spyOn(lajiStoreService, 'getAll');
        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia');

        await mediaAccessInterceptor.intercept(mockContext, mockNext);

        expect(mockGet).toHaveBeenCalledTimes(0);
        expect(mockGetAll).toHaveBeenCalledTimes(0);
        expect(mockGetMedia).toHaveBeenCalledTimes(0);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
      });

      it('Admin can edit with multiple documentURI', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'PUT',
            params: {
              type: MediasEnum.images,
              id: 'MM.1'
            },
            user: {
              profile: adminUser
            },
            body: imgMetadata3
          })
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(mockNext, 'handle');

        const mockGet = jest.spyOn(lajiStoreService, 'get');
        const mockGetAll = jest.spyOn(lajiStoreService, 'getAll');
        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia');

        await mediaAccessInterceptor.intercept(mockContext, mockNext);

        expect(mockGet).toHaveBeenCalledTimes(0);
        expect(mockGetAll).toHaveBeenCalledTimes(0);
        expect(mockGetMedia).toHaveBeenCalledTimes(0);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
      });

      it('Kotka admin can edit with single documentURI', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'PUT',
            params: {
              type: MediasEnum.images,
              id: 'MM.1'
            },
            user: {
              profile: adminUser
            },
            body: imgMetadata1
          })
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(mockNext, 'handle');

        const mockGet = jest.spyOn(lajiStoreService, 'get');
        const mockGetAll = jest.spyOn(lajiStoreService, 'getAll');
        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia');

        await mediaAccessInterceptor.intercept(mockContext, mockNext);

        expect(mockGet).toHaveBeenCalledTimes(0);
        expect(mockGetAll).toHaveBeenCalledTimes(0);
        expect(mockGetMedia).toHaveBeenCalledTimes(0);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
      });

      it('Kotka admin can edit with multiple documentURI', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'PUT',
            params: {
              type: MediasEnum.images,
              id: 'MM.1'
            },
            user: {
              profile: kotkaAdminUser
            },
            body: imgMetadata3
          })
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(mockNext, 'handle');

        const mockGet = jest.spyOn(lajiStoreService, 'get');
        const mockGetAll = jest.spyOn(lajiStoreService, 'getAll');
        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia');

        await mediaAccessInterceptor.intercept(mockContext, mockNext);

        expect(mockGet).toHaveBeenCalledTimes(0);
        expect(mockGetAll).toHaveBeenCalledTimes(0);
        expect(mockGetMedia).toHaveBeenCalledTimes(0);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
      });

      it('Owner of single documentURI can edit', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'PUT',
            params: {
              type: MediasEnum.images,
              id: 'MM.1'
            },
            user: {
              profile: MOS1User
            },
            body: imgMetadata1
          })
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(mockNext, 'handle');

        const mockGet = jest.spyOn(lajiStoreService, 'get').mockImplementation(() => of({ status: 200, statusText: '', headers: {}, config: {}, data: MOS1Doc} as AxiosResponse));
        const mockGetAll = jest.spyOn(lajiStoreService, 'getAll');
        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia').mockImplementation(() => of(imgTripleMeta1 as Media));

        await mediaAccessInterceptor.intercept(mockContext, mockNext);

        console.log(mockGet)
        expect(mockGet).toHaveBeenCalledTimes(1);
        expect(mockGet.mock.calls[0][0]).toBe(KotkaDocumentObjectFullType.document);
        expect(mockGet.mock.calls[0][1]).toBe('JX.1');
        expect(mockGetAll).toHaveBeenCalledTimes(0);
        expect(mockGetMedia).toHaveBeenCalledTimes(1);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
      });

      it('Owner of any of multiple documentURI can edit', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'PUT',
            params: {
              type: MediasEnum.images,
              id: 'MM.1'
            },
            user: {
              profile: MOS1User
            },
            body: imgMetadata3
          })
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(mockNext, 'handle');

        const mockGet = jest.spyOn(lajiStoreService, 'get');
        const mockGetAll = jest.spyOn(lajiStoreService, 'getAll').mockImplementation(() => of({ status: 200, statusText: '', headers: {}, config: {}, data: { member: [ MOS1Doc, MOS2Doc, MOS3Doc ]}} as AxiosResponse));
        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia').mockImplementation(() => of(imgTripleMeta3 as Media));

        await mediaAccessInterceptor.intercept(mockContext, mockNext);

        expect(mockGet).toHaveBeenCalledTimes(0);
        expect(mockGetAll).toHaveBeenCalledTimes(1);
        expect(mockGetAll.mock.calls[0][0]).toBe(KotkaDocumentObjectFullType.document);
        expect(mockGetAll.mock.calls[0][1]).toStrictEqual({'fields': 'id,owner', 'q': 'id: "JX.1","JX.2","luomus:JX.3"'});
        expect(mockGetMedia).toHaveBeenCalledTimes(1);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
      });

      it('Non-owner of one documentURI cant edit', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'PUT',
            params: {
              type: MediasEnum.images,
              id: 'MM.1'
            },
            user: {
              profile: MOS1User
            },
            body: imgMetadata2
          })
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(mockNext, 'handle');

        const mockGet = jest.spyOn(lajiStoreService, 'get').mockImplementation(() => of({ status: 200, statusText: '', headers: {}, config: {}, data: MOS2Doc} as AxiosResponse));
        const mockGetAll = jest.spyOn(lajiStoreService, 'getAll');
        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia').mockImplementation(() => of(imgTripleMeta2 as Media));

        expect.assertions(10);

        try {
          await mediaAccessInterceptor.intercept(mockContext, mockNext);
        } catch (e) {
          expect(e.status).toBe(403);
          expect(e.message).toBe('Forbidden to edit image metadata, no right to edit associated document/s');
          expect(mockGet).toHaveBeenCalledTimes(1);
          expect(mockGet.mock.calls[0][0]).toBe(KotkaDocumentObjectFullType.document);
          expect(mockGet.mock.calls[0][1]).toBe('JX.2');
          expect(mockGetAll).toHaveBeenCalledTimes(0);
          expect(mockGetMedia).toHaveBeenCalledTimes(1);
          expect(mockGetMedia.mock.calls[0][0]).toBe('MM.1');
          expect(mockGetMedia.mock.calls[0][1]).toBe(MediasEnum.images);
          expect(mockNext.handle).toHaveBeenCalledTimes(0);
        }
      });

      it('Non-owner of multipe documentURI cant edit', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'PUT',
            params: {
              type: MediasEnum.images,
              id: 'MM.2'
            },
            user: {
              profile: MOS4User
            },
            body: imgMetadata3
          })
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(mockNext, 'handle');

        const mockGet = jest.spyOn(lajiStoreService, 'get');
        const mockGetAll = jest.spyOn(lajiStoreService, 'getAll').mockImplementation(() => of({ status: 200, statusText: '', headers: {}, config: {}, data: { member: [MOS1Doc, MOS2Doc, MOS3Doc ]}} as AxiosResponse));
        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia').mockImplementation(() => of(imgTripleMeta3 as Media));

        expect.assertions(10);

        try {
          await mediaAccessInterceptor.intercept(mockContext, mockNext);
        } catch (e) {
          expect(e.status).toBe(403);
          expect(e.message).toBe('Forbidden to edit image metadata, no right to edit associated document/s');
          expect(mockGet).toHaveBeenCalledTimes(0);
          expect(mockGetAll).toHaveBeenCalledTimes(1);
          expect(mockGetAll.mock.calls[0][0]).toBe(KotkaDocumentObjectFullType.document);
          expect(mockGetAll.mock.calls[0][1]).toStrictEqual({'fields': 'id,owner', 'q': 'id: "JX.1","JX.2","luomus:JX.3"'});
          expect(mockGetMedia).toHaveBeenCalledTimes(1);
          expect(mockGetMedia.mock.calls[0][0]).toBe('MM.2');
          expect(mockGetMedia.mock.calls[0][1]).toBe(MediasEnum.images);
          expect(mockNext.handle).toHaveBeenCalledTimes(0);
        }
      });

      it('Owner of a document can add it to documentURI-field', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'PUT',
            params: {
              type: MediasEnum.images,
              id: 'MM.1'
            },
            user: {
              profile: MOS1User
            },
            body: imgMetadata4
          })
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(mockNext, 'handle');

        const mockGet = jest.spyOn(lajiStoreService, 'get');
        const mockGetAll = jest.spyOn(lajiStoreService, 'getAll').mockImplementation(() => of({ status: 200, statusText: '', headers: {}, config: {}, data: { member: [MOS1Doc, MOS1Doc2 ]}} as AxiosResponse));
        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia').mockImplementation(() => of(imgTripleMeta1 as Media));

        await mediaAccessInterceptor.intercept(mockContext, mockNext);

        expect(mockGet).toHaveBeenCalledTimes(0);
        expect(mockGetAll).toHaveBeenCalledTimes(1);
        expect(mockGetAll.mock.calls[0][0]).toBe(KotkaDocumentObjectFullType.document);
        expect(mockGetAll.mock.calls[0][1]).toStrictEqual({'fields': 'id,owner', 'q': 'id: "JX.1","JX.4"'});
        expect(mockGetMedia).toHaveBeenCalledTimes(1);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
      })

      it('Owner of document can remove it from documentURI-field', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'PUT',
            params: {
              type: MediasEnum.images,
              id: 'MM.1'
            },
            user: {
              profile: MOS1User
            },
            body: imgMetadata1
          })
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(mockNext, 'handle');

        const mockGet = jest.spyOn(lajiStoreService, 'get');
        const mockGetAll = jest.spyOn(lajiStoreService, 'getAll').mockImplementation(() => of({ status: 200, statusText: '', headers: {}, config: {}, data: { member: [ MOS1Doc, MOS1Doc2 ]}} as AxiosResponse));
        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia').mockImplementation(() => of(imgTripleMeta4 as Media));

        await mediaAccessInterceptor.intercept(mockContext, mockNext);

        expect(mockGet).toHaveBeenCalledTimes(0);
        expect(mockGetAll).toHaveBeenCalledTimes(1);
        expect(mockGetAll.mock.calls[0][0]).toBe(KotkaDocumentObjectFullType.document);
        expect(mockGetAll.mock.calls[0][1]).toStrictEqual({'fields': 'id,owner', 'q': 'id: "JX.1","JX.4"'});
        expect(mockGetMedia).toHaveBeenCalledTimes(1);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
      })

      it('Non-owner cant add a document to documentURI-field', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'PUT',
            params: {
              type: MediasEnum.images,
              id: 'MM.1'
            },
            user: {
              profile: MOS1User
            },
            body: imgMetadata3
          })
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(mockNext, 'handle');

        const mockGet = jest.spyOn(lajiStoreService, 'get');
        const mockGetAll = jest.spyOn(lajiStoreService, 'getAll').mockImplementation(() => of({ status: 200, statusText: '', headers: {}, config: {}, data: { member: [ MOS1Doc, MOS2Doc, MOS3Doc ]}} as AxiosResponse));
        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia').mockImplementation(() => of(imgTripleMeta1 as Media));

        expect.assertions(10);

        try {
          await mediaAccessInterceptor.intercept(mockContext, mockNext);
        } catch (e) {
          expect(e.status).toBe(403);
          expect(e.message).toBe('Forbidden to add specimenID to metadata, no right to edit associated document/s');
          expect(mockGet).toHaveBeenCalledTimes(0);
          expect(mockGetAll).toHaveBeenCalledTimes(1);
          expect(mockGetAll.mock.calls[0][0]).toBe(KotkaDocumentObjectFullType.document);
          expect(mockGetAll.mock.calls[0][1]).toStrictEqual({'fields': 'id,owner', 'q': 'id: "JX.1","JX.2","luomus:JX.3"'});
          expect(mockGetMedia).toHaveBeenCalledTimes(1);
          expect(mockGetMedia.mock.calls[0][0]).toBe('MM.1');
          expect(mockGetMedia.mock.calls[0][1]).toBe(MediasEnum.images);
          expect(mockNext.handle).toHaveBeenCalledTimes(0);
        }
      })

      it('Non-owner cant remove a document from documentURI-field', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'PUT',
            params: {
              type: MediasEnum.images,
              id: 'MM.1'
            },
            user: {
              profile: MOS1User
            },
            body: imgMetadata1
          })
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(mockNext, 'handle');

        const mockGet = jest.spyOn(lajiStoreService, 'get');
        const mockGetAll = jest.spyOn(lajiStoreService, 'getAll').mockImplementation(() => of({ status: 200, statusText: '', headers: {}, config: {}, data: { member: [ MOS1Doc, MOS2Doc, MOS3Doc ]}} as AxiosResponse));
        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia').mockImplementation(() => of(imgTripleMeta3 as Media));

        expect.assertions(10);

        try {
          await mediaAccessInterceptor.intercept(mockContext, mockNext);
        } catch (e) {
          expect(e.status).toBe(403);
          expect(e.message).toBe('Forbidden to remove specimenID from metadata, no right to edit associated document/s');
          expect(mockGet).toHaveBeenCalledTimes(0);
          expect(mockGetAll).toHaveBeenCalledTimes(1);
          expect(mockGetAll.mock.calls[0][0]).toBe(KotkaDocumentObjectFullType.document);
          expect(mockGetAll.mock.calls[0][1]).toStrictEqual({'fields': 'id,owner', 'q': 'id: "JX.1","JX.2","luomus:JX.3"'});
          expect(mockGetMedia).toHaveBeenCalledTimes(1);
          expect(mockGetMedia.mock.calls[0][0]).toBe('MM.1');
          expect(mockGetMedia.mock.calls[0][1]).toBe(MediasEnum.images);
          expect(mockNext.handle).toHaveBeenCalledTimes(0);
        }
      })
    })

    describe('DELETE', () => {
      it('Admin can edit with single documentURI', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'PUT',
            params: {
              type: MediasEnum.images,
              id: 'MM.1'
            },
            user: {
              profile: adminUser
            },
            body: imgMetadata1
          })
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(mockNext, 'handle');

        const mockGet = jest.spyOn(lajiStoreService, 'get');
        const mockGetAll = jest.spyOn(lajiStoreService, 'getAll');
        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia');

        await mediaAccessInterceptor.intercept(mockContext, mockNext);

        expect(mockGet).toHaveBeenCalledTimes(0);
        expect(mockGetAll).toHaveBeenCalledTimes(0);
        expect(mockGetMedia).toHaveBeenCalledTimes(0);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
      });

      it('Admin can delete image', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'DELETE',
            params: {
              type: MediasEnum.images,
              id: 'MM.1'
            },
            user: {
              profile: adminUser
            },
          })
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(mockNext, 'handle');

        const mockGet = jest.spyOn(lajiStoreService, 'get');
        const mockGetAll = jest.spyOn(lajiStoreService, 'getAll');
        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia');

        await mediaAccessInterceptor.intercept(mockContext, mockNext);

        expect(mockGet).toHaveBeenCalledTimes(0);
        expect(mockGetAll).toHaveBeenCalledTimes(0);
        expect(mockGetMedia).toHaveBeenCalledTimes(0);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
      });

      it('Kotka admin can delete image', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'DELETE',
            params: {
              type: MediasEnum.images,
              id: 'MM.1'
            },
            user: {
              profile: kotkaAdminUser
            }
          })
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(mockNext, 'handle');

        const mockGet = jest.spyOn(lajiStoreService, 'get');
        const mockGetAll = jest.spyOn(lajiStoreService, 'getAll');
        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia');

        await mediaAccessInterceptor.intercept(mockContext, mockNext);

        expect(mockGet).toHaveBeenCalledTimes(0);
        expect(mockGetAll).toHaveBeenCalledTimes(0);
        expect(mockGetMedia).toHaveBeenCalledTimes(0);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
      });

      it('Advanced user can delete image with one documentURI in metadata owned', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'DELETE',
            params: {
              type: MediasEnum.images,
              id: 'MM.1'
            },
            user: {
              profile: advancedUser
            }
          })
        })});

        const mockNext = createMock<CallHandler>();

        const mockGet = jest.spyOn(lajiStoreService, 'get').mockImplementation(() => of({ status: 200, statusText: '', headers: {}, config: {}, data: MOS1Doc} as AxiosResponse));
        const mockGetAll = jest.spyOn(lajiStoreService, 'getAll');
        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia').mockImplementation(() => of(imgTripleMeta1 as Media));

        await mediaAccessInterceptor.intercept(mockContext, mockNext);

        expect(mockGet).toHaveBeenCalledTimes(1);
        expect(mockGet.mock.calls[0][0]).toBe(KotkaDocumentObjectFullType.document);
        expect(mockGet.mock.calls[0][1]).toBe('JX.1');
        expect(mockGetAll).toHaveBeenCalledTimes(0);
        expect(mockGetMedia).toHaveBeenCalledTimes(1);
        expect(mockGetMedia.mock.calls[0][0]).toBe('MM.1');
        expect(mockGetMedia.mock.calls[0][1]).toBe(MediasEnum.images);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
      });

      it('Advanced user can delete image with multiple documentURIs in metadata owned', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'DELETE',
            params: {
              type: MediasEnum.images,
              id: 'MM.1'
            },
            user: {
              profile: advancedUser
            }
          })
        })});

        const mockNext = createMock<CallHandler>();

        const mockGet = jest.spyOn(lajiStoreService, 'get');
        const mockGetAll = jest.spyOn(lajiStoreService, 'getAll').mockImplementation(() => of({ status: 200, statusText: '', headers: {}, config: {}, data: { member: [ MOS1Doc, MOS1Doc2 ]}} as AxiosResponse));
        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia').mockImplementation(() => of(imgTripleMeta4 as Media));

        await mediaAccessInterceptor.intercept(mockContext, mockNext);

        expect(mockGet).toHaveBeenCalledTimes(0);
        expect(mockGetAll).toHaveBeenCalledTimes(1);
        expect(mockGetAll.mock.calls[0][0]).toBe(KotkaDocumentObjectFullType.document);
        expect(mockGetAll.mock.calls[0][1]).toStrictEqual({'fields': 'id,owner', 'q': 'id: "JX.1","JX.4"'});
        expect(mockGetMedia).toHaveBeenCalledTimes(1);
        expect(mockGetMedia.mock.calls[0][0]).toBe('MM.1');
        expect(mockGetMedia.mock.calls[0][1]).toBe(MediasEnum.images);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
      });

      it('Advanced user cant delete image with one documentURI in metadata not owned', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'DELETE',
            params: {
              type: MediasEnum.images,
              id: 'MM.1'
            },
            user: {
              profile: advancedUser
            }
          })
        })});

        const mockNext = createMock<CallHandler>();

        const mockGet = jest.spyOn(lajiStoreService, 'get').mockImplementation(() => of({ status: 200, statusText: '', headers: {}, config: {}, data: MOS2Doc} as AxiosResponse));
        const mockGetAll = jest.spyOn(lajiStoreService, 'getAll');
        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia').mockImplementation(() => of(imgTripleMeta2 as Media));

        expect.assertions(10);

        try {
        await mediaAccessInterceptor.intercept(mockContext, mockNext);
        } catch (e) {
          expect(e.status).toBe(403);
          expect(e.message).toBe('Forbidden, no rights to document/s associated with the image');
          expect(mockGet).toHaveBeenCalledTimes(1);
          expect(mockGet.mock.calls[0][0]).toBe(KotkaDocumentObjectFullType.document);
          expect(mockGet.mock.calls[0][1]).toBe('JX.2');
          expect(mockGetAll).toHaveBeenCalledTimes(0);
          expect(mockGetMedia).toHaveBeenCalledTimes(1);
          expect(mockGetMedia.mock.calls[0][0]).toBe('MM.1');
          expect(mockGetMedia.mock.calls[0][1]).toBe(MediasEnum.images);
          expect(mockNext.handle).toHaveBeenCalledTimes(0);
        }
      });

      it('Advanced user cant delete image with multiple documentURIs in metadata not all owned', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'DELETE',
            params: {
              type: MediasEnum.images,
              id: 'MM.1'
            },
            user: {
              profile: advancedUser
            }
          })
        })});

        const mockNext = createMock<CallHandler>();

        const mockGet = jest.spyOn(lajiStoreService, 'get');
        const mockGetAll = jest.spyOn(lajiStoreService, 'getAll').mockImplementation(() => of({ status: 200, statusText: '', headers: {}, config: {}, data: { member: [ MOS1Doc, MOS2Doc, MOS3Doc ]}} as AxiosResponse));
        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia').mockImplementation(() => of(imgTripleMeta3 as Media));

        expect.assertions(10);

        try {
        await mediaAccessInterceptor.intercept(mockContext, mockNext);
        } catch (e) {
          expect(e.status).toBe(403);
          expect(e.message).toBe('Forbidden, no rights to document/s associated with the image');
          expect(mockGet).toHaveBeenCalledTimes(0);
          expect(mockGetAll).toHaveBeenCalledTimes(1);
          expect(mockGetAll.mock.calls[0][0]).toBe(KotkaDocumentObjectFullType.document);
          expect(mockGetAll.mock.calls[0][1]).toStrictEqual({'fields': 'id,owner', 'q': 'id: "JX.1","JX.2","luomus:JX.3"'});
          expect(mockGetMedia).toHaveBeenCalledTimes(1);
          expect(mockGetMedia.mock.calls[0][0]).toBe('MM.1');
          expect(mockGetMedia.mock.calls[0][1]).toBe(MediasEnum.images);
          expect(mockNext.handle).toHaveBeenCalledTimes(0);
        }
      });

      it('Normal users cant delete images', async () => {
        const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
          getRequest: () => ({
            method: 'DELETE',
            params: {
              type: MediasEnum.images,
              id: 'MM.1'
            },
            user: {
              profile: MOS1User
            }
          })
        })});

        const mockNext = createMock<CallHandler>();

        const mockGet = jest.spyOn(lajiStoreService, 'get');
        const mockGetAll = jest.spyOn(lajiStoreService, 'getAll');
        const mockGetMedia = jest.spyOn(mediaApiService, 'getMedia');

        expect.assertions(6);

        try {
        await mediaAccessInterceptor.intercept(mockContext, mockNext);
        } catch (e) {
          expect(e.status).toBe(403);
          expect(e.message).toBe('Forbidden');
          expect(mockGet).toHaveBeenCalledTimes(0);
          expect(mockGetAll).toHaveBeenCalledTimes(0);
          expect(mockGetMedia).toHaveBeenCalledTimes(0);
          expect(mockNext.handle).toHaveBeenCalledTimes(0);
        }
      });
    });
  });
});
