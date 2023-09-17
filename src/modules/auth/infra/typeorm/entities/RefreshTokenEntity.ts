import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

import { v4 as uuidV4 } from 'uuid';

@Entity('refresh_tokens')
class RefreshTokenEntity {
  @PrimaryColumn('uuid')
  refresh_token: string;

  @Column('int')
  user_id: number;

  @Column('uuid')
  @OneToOne(() => RefreshTokenEntity)
  @JoinColumn({ name: 'next_token', referencedColumnName: 'refresh_token' })
  next_token?: string;

  @Column()
  expires_in: Date;

  constructor() {
    if (!this.refresh_token) {
      this.refresh_token = uuidV4();
    }
  }
}

export { RefreshTokenEntity };
